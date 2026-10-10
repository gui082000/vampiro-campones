import { describe, expect, it } from 'vitest';
import { FOME_POR_HORA_DE_DIA, FOME_POR_HORA_DE_NOITE, QUEIMADURA_DO_AMANHECER } from '../src/config';
import { ALIMENTOS, PODERES } from '../src/dados/vampiro';
import { receitasDe } from '../src/estado/Artesanato';
import { Energia } from '../src/estado/Energia';
import { Inventario } from '../src/estado/Inventario';
import { Relacoes, registrarMorte, PONTOS_POR_CORACAO } from '../src/estado/Relacoes';
import {
  Vampiro,
  beber,
  comprarPoder,
  fecharDia,
  passarTempo,
  queimarNoAmanhecer,
  sinalVisivel,
  usarItemDoVampiro,
} from '../src/estado/Vampiro';

const ctx = (hora: number, foraDeCasa = true, energia = new Energia()) => ({ hora, dia: 1, foraDeCasa, energia });

describe('Fome e sinais', () => {
  it('a fome sobe mais rápido à noite', () => {
    const dia = new Vampiro();
    const noite = new Vampiro();
    dia.fome = noite.fome = 0;
    passarTempo(dia, 10, false, ctx(9));
    passarTempo(noite, 10, true, ctx(22));
    expect(dia.fome).toBeCloseTo(10 * FOME_POR_HORA_DE_DIA);
    expect(noite.fome).toBeCloseTo(10 * FOME_POR_HORA_DE_NOITE);
  });

  it('os sinais aparecem com a fome e as ervas de disfarce escondem', () => {
    const v = new Vampiro();
    v.fome = 30;
    expect(sinalVisivel(v, 1)).toBeNull();
    v.fome = 80;
    expect(sinalVisivel(v, 1)).toBe('Olhos vermelhos');
    v.disfarcadoNoDia = 1;
    expect(sinalVisivel(v, 1)).toBeNull();
    expect(sinalVisivel(v, 2)).toBe('Olhos vermelhos');
  });

  it('o sol forte cansa quem está com fome e fora de casa, menos com o unguento', () => {
    const v = new Vampiro();
    v.fome = 60;
    const energia = new Energia();
    passarTempo(v, 2, false, ctx(12, true, energia));
    expect(energia.atual).toBeLessThan(energia.maxima);

    const dentro = new Energia();
    passarTempo(v, 2, false, ctx(12, false, dentro));
    expect(dentro.atual).toBe(dentro.maxima);

    v.protegidoDoSolNoDia = 1;
    const protegido = new Energia();
    passarTempo(v, 2, false, ctx(12, true, protegido));
    expect(protegido.atual).toBe(protegido.maxima);
  });

  it('dois dias inteiros com fome 100 é o fim', () => {
    const v = new Vampiro();
    v.fome = 100;
    expect(fecharDia(v)).toBe(false);
    expect(fecharDia(v)).toBe(true);

    const salvo = new Vampiro();
    salvo.fome = 100;
    fecharDia(salvo);
    salvo.fome = 40;
    expect(fecharDia(salvo)).toBe(false);
    expect(salvo.diasNoLimite).toBe(0);
  });

  it('amanhecer fora de casa queima', () => {
    const v = new Vampiro();
    v.fome = 10;
    const energia = new Energia();
    queimarNoAmanhecer(v, energia);
    expect(energia.atual).toBe(energia.maxima - QUEIMADURA_DO_AMANHECER.energia);
    expect(v.fome).toBe(10 + QUEIMADURA_DO_AMANHECER.fome);
  });
});

describe('Alimentação e poderes', () => {
  it('beber tira fome, dá essência e a primeira mordida libera as receitas do vampiro', () => {
    const v = new Vampiro();
    v.fome = 90;
    expect(receitasDe('bancada', v.jaMordeu)).not.toContain('unguentoSolar');
    beber(v, 'cervo', 'um cervo');
    expect(v.fome).toBe(90 - ALIMENTOS.cervo.fome);
    expect(v.essencia).toBe(ALIMENTOS.cervo.essencia);
    expect(receitasDe('bancada', v.jaMordeu)).toContain('unguentoSolar');
  });

  it('matar sacia mais do que beber pouco', () => {
    expect(ALIMENTOS.aldeaoFim.fome).toBeGreaterThan(ALIMENTOS.aldeaoPouco.fome);
    expect(ALIMENTOS.viajanteFim.fome).toBeGreaterThan(ALIMENTOS.viajantePouco.fome);
    expect(ALIMENTOS.animalDaFazenda.fome).toBeLessThan(ALIMENTOS.viajantePouco.fome);
  });

  it('poderes custam essência e não se compram duas vezes', () => {
    const v = new Vampiro();
    expect(comprarPoder(v, 'hipnose').mudou).toBe(false);
    v.essencia = PODERES.hipnose.custo;
    expect(comprarPoder(v, 'hipnose').mudou).toBe(true);
    expect(v.tem('hipnose')).toBe(true);
    expect(v.essencia).toBe(0);
    v.essencia = 10;
    expect(comprarPoder(v, 'hipnose').mudou).toBe(false);
  });

  it('itens do vampiro: tônico tira fome, ervas disfarçam', () => {
    const v = new Vampiro();
    v.fome = 50;
    const inv = new Inventario([{ item: 'tonicoRubro', qtd: 1 }, { item: 'ervasDeDisfarce', qtd: 1 }]);
    usarItemDoVampiro(v, inv, 3);
    expect(v.fome).toBe(30);
    inv.selecionar(1);
    usarItemDoVampiro(v, inv, 3);
    expect(v.disfarcadoNoDia).toBe(3);
  });

  it('matar um aldeão esfria a vila inteira', () => {
    const r = new Relacoes();
    r.somar('helena', 5 * PONTOS_POR_CORACAO);
    registrarMorte(r, 'bento');
    expect(r.vivo('bento')).toBe(false);
    expect(r.coracoes('helena')).toBe(4);
  });
});
