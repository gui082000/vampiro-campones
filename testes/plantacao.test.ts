import { describe, expect, it } from 'vitest';
import { CAPACIDADE_REGADOR, CUSTO_DE_ENERGIA, MULTIPLICADOR_ADUBO } from '../src/config';
import type { Estacao } from '../src/dados/estacoes';
import type { IdItem } from '../src/dados/itens';
import { PLANTAS } from '../src/dados/plantas';
import { Energia } from '../src/estado/Energia';
import { Inventario } from '../src/estado/Inventario';
import {
  Lavoura,
  crescer,
  estaPronto,
  mudarDeEstacao,
  novoCanteiro,
  secar,
  usarNoCanteiro,
  type Canteiro,
  type ContextoDaFazenda,
} from '../src/estado/Plantacao';

function contexto(estacao: Estacao = 'primavera'): ContextoDaFazenda {
  const inventario = new Inventario([
    { item: 'enxada', qtd: 1 },
    { item: 'regador', qtd: 1 },
    { item: 'sementeTrigo', qtd: 5 },
    { item: 'sementeLirio', qtd: 2 },
    { item: 'sementeGirassol', qtd: 2 },
    { item: 'adubo', qtd: 2 },
  ]);
  return { inventario, energia: new Energia(), estacao };
}

// Aperta E no canteiro com esse item na mão
function usar(c: Canteiro, ctx: ContextoDaFazenda, item: IdItem) {
  ctx.inventario.selecionado = ctx.inventario.slots.findIndex((s) => s?.item === item);
  return usarNoCanteiro(c, ctx);
}

function plantado(semente: IdItem = 'sementeTrigo', estacao: Estacao = 'primavera') {
  const ctx = contexto(estacao);
  const c = novoCanteiro(0, 0);
  usar(c, ctx, 'enxada');
  usar(c, ctx, semente);
  return { c, ctx };
}

describe('Plantação', () => {
  it('a enxada ara a terra e gasta energia', () => {
    const ctx = contexto();
    const c = novoCanteiro(0, 0);
    expect(usar(c, ctx, 'enxada').mudou).toBe(true);
    expect(c.arado).toBe(true);
    expect(ctx.energia.atual).toBe(ctx.energia.maxima - CUSTO_DE_ENERGIA.arar);
  });

  it('plantar gasta 1 semente da mão; não dá para plantar sem arar', () => {
    const ctx = contexto();
    const c = novoCanteiro(0, 0);
    expect(usar(c, ctx, 'sementeTrigo').mudou).toBe(false);

    usar(c, ctx, 'enxada');
    usar(c, ctx, 'sementeTrigo');
    expect(c.plantio?.planta).toBe('trigo');
    expect(ctx.inventario.quantidade('sementeTrigo')).toBe(4);
  });

  it('não planta fora da estação da planta', () => {
    const ctx = contexto('primavera');
    const c = novoCanteiro(0, 0);
    usar(c, ctx, 'enxada');
    const r = usar(c, ctx, 'sementeGirassol'); // girassol é de verão
    expect(r.mudou).toBe(false);
    expect(r.aviso).toContain('não cresce na primavera');
  });

  it('regar gasta água do regador; com o regador vazio não rega', () => {
    const { c, ctx } = plantado();
    usar(c, ctx, 'regador');
    expect(c.regado).toBe(true);
    expect(ctx.inventario.aguaNoRegador).toBe(CAPACIDADE_REGADOR - 1);

    const outro = novoCanteiro(1, 0);
    usar(outro, ctx, 'enxada');
    ctx.inventario.aguaNoRegador = 0;
    expect(usar(outro, ctx, 'regador').aviso).toContain('vazio');
  });

  it('só cresce regada, e a terra seca no novo dia', () => {
    const { c, ctx } = plantado();
    expect(crescer(c, 10, false)).toBe(false);

    usar(c, ctx, 'regador');
    crescer(c, 10, false);
    expect(c.plantio?.horas).toBe(10);

    secar(c);
    expect(crescer(c, 10, false)).toBe(false);
  });

  it(`o trigo fica pronto depois de ${PLANTAS.trigo.horas} horas regado`, () => {
    const { c, ctx } = plantado();
    usar(c, ctx, 'regador');
    crescer(c, PLANTAS.trigo.horas - 1, false);
    expect(estaPronto(c)).toBe(false);
    crescer(c, 1, true);
    expect(estaPronto(c)).toBe(true);
  });

  it('o girassol só cresce de dia e o lírio-da-lua só à noite', () => {
    const girassol = plantado('sementeGirassol', 'verao');
    usar(girassol.c, girassol.ctx, 'regador');
    expect(crescer(girassol.c, 5, true)).toBe(false);
    expect(crescer(girassol.c, 5, false)).toBe(true);

    const lirio = plantado('sementeLirio');
    usar(lirio.c, lirio.ctx, 'regador');
    expect(crescer(lirio.c, 5, false)).toBe(false);
    expect(crescer(lirio.c, 5, true)).toBe(true);
  });

  it('terra adubada faz a planta crescer mais rápido', () => {
    const { c, ctx } = plantado();
    usar(c, ctx, 'adubo');
    usar(c, ctx, 'regador');
    crescer(c, 10, false);
    expect(c.plantio?.horas).toBeCloseTo(10 * MULTIPLICADOR_ADUBO);
  });

  it('colher dá a quantidade da planta e deixa a terra arada', () => {
    const { c, ctx } = plantado();
    usar(c, ctx, 'regador');
    crescer(c, PLANTAS.trigo.horas, false);

    const r = usar(c, ctx, 'enxada'); // colher funciona com qualquer item
    expect(r.mudou).toBe(true);
    expect(ctx.inventario.quantidade('trigo')).toBe(PLANTAS.trigo.quantidade);
    expect(c.plantio).toBeNull();
    expect(c.arado).toBe(true);
  });

  it('com o inventário cheio a colheita fica no pé', () => {
    const { c, ctx } = plantado();
    usar(c, ctx, 'regador');
    crescer(c, PLANTAS.trigo.horas, false);
    ctx.inventario.slots = ctx.inventario.slots.map(() => ({ item: 'pedra', qtd: 99 }));

    expect(usar(c, ctx, 'enxada').aviso).toBe('Inventário cheio');
    expect(estaPronto(c)).toBe(true);
  });

  it('na troca de estação, o que não cresce nela morre e pode ser tirado', () => {
    const { c, ctx } = plantado('sementeTrigo');
    expect(mudarDeEstacao(c, 'verao')).toBe(false); // trigo também é de verão
    expect(mudarDeEstacao(c, 'outono')).toBe(true);
    expect(c.plantio?.morta).toBe(true);

    usar(c, ctx, 'regador');
    expect(c.plantio).toBeNull();
  });

  it('a lavoura guarda um canteiro por célula', () => {
    const lavoura = new Lavoura();
    const c = lavoura.pegar(3, 4);
    c.arado = true;
    expect(lavoura.pegar(3, 4).arado).toBe(true);
    expect(lavoura.todos()).toHaveLength(1);
  });
});
