import { describe, expect, it } from 'vitest';
import { Construcoes } from '../src/estado/Construcoes';
import { Criacao } from '../src/estado/Criacao';
import { Diario } from '../src/estado/Diario';
import { Energia } from '../src/estado/Energia';
import { Inventario } from '../src/estado/Inventario';
import { Missoes } from '../src/estado/Missoes';
import { Recipiente } from '../src/estado/Recipiente';
import { Relacoes } from '../src/estado/Relacoes';
import { aplicarSave, gravar, ler, montarSave, type Armazenamento, type Partes } from '../src/estado/Salvamento';
import { Suspeita } from '../src/estado/Suspeita';
import { Vampiro } from '../src/estado/Vampiro';

function novasPartes(): Partes {
  return {
    relogio: { hora: 7, dia: 1 },
    inventario: new Inventario(),
    energia: new Energia(),
    construcoes: new Construcoes(),
    criacao: new Criacao(),
    deposito: new Recipiente(24),
    cofre: new Recipiente(24),
    relacoes: new Relacoes(),
    missoes: new Missoes(),
    diario: new Diario(),
    vampiro: new Vampiro(),
    suspeita: new Suspeita(),
    canteiros: {},
    recursos: [],
    onde: { local: 'fora', coluna: 106, linha: 15, volta: { coluna: 0, linha: 0 }, salaDeVolta: 'fora' },
  };
}

function memoria(): Armazenamento {
  const dados = new Map<string, string>();
  return { getItem: (c) => dados.get(c) ?? null, setItem: (c, v) => void dados.set(c, v) };
}

describe('Salvar e carregar', () => {
  it('o que é salvo volta igual ao carregar', () => {
    const original = novasPartes();
    original.relogio.dia = 9;
    original.inventario.adicionar('madeira', 42);
    original.inventario.moedas = 777;
    original.energia.atual = 33;
    original.construcoes.feitas.galinheiro = true;
    original.relacoes.somar('helena', 25);
    original.missoes.situacao.bento1 = 'concluida';
    original.diario.anotar('uma pista');
    original.vampiro.fome = 61;
    original.vampiro.poderes.push('hipnose');
    original.suspeita.valor = 44;

    const armazenamento = memoria();
    expect(gravar(armazenamento, montarSave(original, 'Dia 9'))).toBe(true);

    const carregado = novasPartes();
    aplicarSave(ler(armazenamento)!, carregado);
    expect(carregado.relogio.dia).toBe(9);
    expect(carregado.inventario.quantidade('madeira')).toBe(42);
    expect(carregado.inventario.moedas).toBe(777);
    expect(carregado.energia.atual).toBe(33);
    expect(carregado.construcoes.tem('galinheiro')).toBe(true);
    expect(carregado.relacoes.porAldeao.helena.pontos).toBe(25);
    expect(carregado.missoes.concluidas()).toEqual(['bento1']);
    expect(carregado.diario.pistas).toEqual(['uma pista']);
    expect(carregado.vampiro.fome).toBe(61);
    expect(carregado.vampiro.tem('hipnose')).toBe(true);
    expect(carregado.suspeita.valor).toBe(44);
  });

  it('o corpo carregado continua sendo um dos corpos da lista', () => {
    const original = novasPartes();
    const corpo = { sala: 'fora', coluna: 1, linha: 2, quem: 'um viajante' };
    original.suspeita.corpos.push(corpo);
    original.suspeita.carregando = corpo;
    const carregado = novasPartes();
    aplicarSave(montarSave(original, ''), carregado);
    expect(carregado.suspeita.carregando).toBe(carregado.suspeita.corpos[0]);
  });

  it('sem save, ou save estragado, não carrega nada', () => {
    const armazenamento = memoria();
    expect(ler(armazenamento)).toBeNull();
    armazenamento.setItem('sangue-na-terra:save', '{ estragado');
    expect(ler(armazenamento)).toBeNull();
  });

  it('o save não muda se o jogo continuar depois de salvar', () => {
    const partes = novasPartes();
    const save = montarSave(partes, '');
    partes.inventario.moedas = 1;
    expect((save.inventario as Inventario).moedas).not.toBe(1);
  });
});

describe('Salvar o relógio', () => {
  it('carregar não estraga quem escuta o relógio', async () => {
    const { Relogio } = await import('../src/sistemas/Relogio');
    const relogio = new Relogio();
    relogio.dia = 5;
    const partes = novasPartes();
    partes.relogio = relogio;
    const save = montarSave(partes, '');
    const outro = new Relogio();
    let ouviu = 0;
    const destino = novasPartes();
    destino.relogio = outro;
    aplicarSave(save, destino);
    outro.ouvir('anoiteceu', () => ouviu++);
    outro.hora = 18.9;
    outro.avancar(12000 * 0.2);
    expect(outro.dia).toBe(5);
    expect(ouviu).toBe(1);
  });
});
