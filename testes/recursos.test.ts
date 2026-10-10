import { describe, expect, it } from 'vitest';
import type { Estacao } from '../src/dados/estacoes';
import type { IdItem } from '../src/dados/itens';
import { RECURSOS, type TipoDeRecurso } from '../src/dados/recursos';
import { Energia } from '../src/estado/Energia';
import { Inventario } from '../src/estado/Inventario';
import {
  espalharRecursos,
  estaPresente,
  passarDiaDoRecurso,
  temColheita,
  usarNoRecurso,
  type ContextoDaColeta,
  type NoDeRecurso,
} from '../src/estado/Recursos';
import { criarAleatorio } from '../src/util/aleatorio';

function no(tipo: TipoDeRecurso): NoDeRecurso {
  return { tipo, coluna: 0, linha: 0, golpes: RECURSOS[tipo].golpes, diasParaVoltar: 0 };
}

function contexto(naMao: IdItem | null, estacao: Estacao = 'primavera'): ContextoDaColeta {
  const inventario = new Inventario(naMao ? [{ item: naMao, qtd: 1 }] : []);
  return { inventario, energia: new Energia(), estacao, aleatorio: criarAleatorio(1) };
}

describe('Coleta', () => {
  it('a árvore precisa do machado e cai depois de alguns golpes, soltando madeira', () => {
    const arvore = no('arvore');
    expect(usarNoRecurso(arvore, contexto('enxada')).aviso).toContain('machado');

    const ctx = contexto('machado');
    for (let i = 1; i < RECURSOS.arvore.golpes; i++) {
      usarNoRecurso(arvore, ctx);
      expect(ctx.inventario.quantidade('madeira')).toBe(0);
    }
    usarNoRecurso(arvore, ctx);
    expect(ctx.inventario.quantidade('madeira')).toBeGreaterThanOrEqual(RECURSOS.arvore.solta[0].min);
    expect(estaPresente(arvore, 'primavera')).toBe(false);
    expect(ctx.energia.atual).toBe(ctx.energia.maxima - RECURSOS.arvore.energia * RECURSOS.arvore.golpes);
  });

  it('o que foi colhido volta depois de alguns dias', () => {
    const arvore = no('arvore');
    const ctx = contexto('machado');
    for (let i = 0; i < RECURSOS.arvore.golpes; i++) usarNoRecurso(arvore, ctx);

    for (let d = 1; d < RECURSOS.arvore.diasParaVoltar; d++) passarDiaDoRecurso(arvore);
    expect(estaPresente(arvore, 'primavera')).toBe(false);
    passarDiaDoRecurso(arvore);
    expect(estaPresente(arvore, 'primavera')).toBe(true);
  });

  it('o mato sai com qualquer coisa na mão e dá fibra', () => {
    const ctx = contexto(null);
    expect(usarNoRecurso(no('mato'), ctx).mudou).toBe(true);
    expect(ctx.inventario.quantidade('fibra')).toBeGreaterThan(0);
  });

  it('o arbusto fica no lugar, mas só tem amoras de vez em quando e na estação certa', () => {
    const arbusto = no('arbusto');
    const ctx = contexto(null);
    usarNoRecurso(arbusto, ctx);
    expect(ctx.inventario.quantidade('amora')).toBeGreaterThan(0);
    expect(estaPresente(arbusto, 'primavera')).toBe(true);
    expect(usarNoRecurso(arbusto, ctx).aviso).toBe('Sem frutos agora');

    const outro = no('arbusto');
    expect(temColheita(outro, 'inverno')).toBe(false);
  });

  it('cogumelos só aparecem no outono', () => {
    expect(estaPresente(no('cogumelo'), 'primavera')).toBe(false);
    expect(estaPresente(no('cogumelo'), 'outono')).toBe(true);
  });

  it('não derruba a árvore com o inventário cheio', () => {
    const arvore = no('arvore');
    arvore.golpes = 1;
    const ctx = contexto('machado');
    ctx.inventario.slots = ctx.inventario.slots.map((s, i) => (i === 0 ? s : { item: 'pedra', qtd: 99 }));
    expect(usarNoRecurso(arvore, ctx).aviso).toBe('Inventário cheio');
    expect(estaPresente(arvore, 'primavera')).toBe(true);
  });

  it('espalha os recursos sempre nos mesmos lugares, só em células livres e sem colar', () => {
    const area = { coluna: 0, linha: 0, colunas: 10, linhas: 10 };
    const livre = (coluna: number, linha: number) => coluna !== 5 && linha !== 5;
    const areas = [{ tipo: 'arvore' as const, quantidade: 8, area }];

    const a = espalharRecursos(areas, livre, criarAleatorio(7));
    const b = espalharRecursos(areas, livre, criarAleatorio(7));
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(0);
    for (const n of a) {
      expect(livre(n.coluna, n.linha)).toBe(true);
      const vizinhos = a.filter((m) => m !== n && Math.abs(m.coluna - n.coluna) <= 1 && Math.abs(m.linha - n.linha) <= 1);
      expect(vizinhos).toHaveLength(0);
    }
  });
});
