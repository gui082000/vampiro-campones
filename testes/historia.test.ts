import { describe, expect, it } from 'vitest';
import { EVENTOS, FINAIS, PAGINAS_DO_DIARIO } from '../src/dados/historia';
import {
  Historia,
  atoDoDia,
  finaisNaColina,
  paginasDisponiveis,
  proximoEvento,
  type ContextoDaHistoria,
} from '../src/estado/Historia';
import { Inventario } from '../src/estado/Inventario';
import { Missoes } from '../src/estado/Missoes';
import { PONTOS_POR_CORACAO, Relacoes } from '../src/estado/Relacoes';
import { Vampiro } from '../src/estado/Vampiro';

function contexto(): ContextoDaHistoria {
  return { relacoes: new Relacoes(), missoes: new Missoes(), vampiro: new Vampiro(), inventario: new Inventario([]) };
}

const disponivel = (ctx: ContextoDaHistoria, id: keyof typeof FINAIS) => finaisNaColina(ctx).find((f) => f.id === id)!.disponivel;

describe('História', () => {
  it('os atos começam nos dias 1, 8 e 26', () => {
    expect(atoDoDia(1).numero).toBe(1);
    expect(atoDoDia(8).numero).toBe(2);
    expect(atoDoDia(25).numero).toBe(2);
    expect(atoDoDia(26).numero).toBe(3);
  });

  it('as cenas acontecem na ordem dos dias, uma vez cada', () => {
    const h = new Historia();
    const ctx = contexto();
    expect(proximoEvento(h, 1, 7, ctx)).toBe('chegada');
    h.eventosVistos.push('chegada');
    expect(proximoEvento(h, 2, 12, ctx)).toBeNull();
    expect(proximoEvento(h, 3, 8, ctx)).toBe('cartaDoTio');
  });

  it('a Helena só conta o segredo se confiar no Tomás', () => {
    const h = new Historia();
    h.eventosVistos = Object.keys(EVENTOS).filter((id) => id !== 'helenaRevela');
    const ctx = contexto();
    expect(proximoEvento(h, 21, 9, ctx)).toBeNull();
    ctx.relacoes.somar('helena', 3 * PONTOS_POR_CORACAO);
    expect(proximoEvento(h, 21, 9, ctx)).toBe('helenaRevela');
  });

  it('nenhuma cena tem mais de 5 caixas de texto', () => {
    for (const [id, e] of Object.entries(EVENTOS)) expect(e.falas.length, id).toBeLessThanOrEqual(5);
  });

  it('as páginas do diário do tio vão liberando com os dias', () => {
    expect(paginasDisponiveis(1)).toBe(1);
    expect(paginasDisponiveis(30)).toBe(PAGINAS_DO_DIARIO.length);
  });
});

describe('Finais na colina', () => {
  it('quem nunca bebeu de gente pode escolher a terra limpa; guardião sempre pode', () => {
    const ctx = contexto();
    ctx.vampiro.registro.push('cervo:um cervo');
    expect(disponivel(ctx, 'terraLimpa')).toBe(true);
    expect(disponivel(ctx, 'guardiao')).toBe(true);
    ctx.vampiro.registro.push('viajantePouco:um peregrino');
    expect(disponivel(ctx, 'terraLimpa')).toBe(false);
  });

  it('redenção precisa do elixir e de nenhuma morte', () => {
    const ctx = contexto();
    expect(disponivel(ctx, 'redencao')).toBe(false);
    ctx.inventario.adicionar('elixirDaAurora', 1);
    expect(disponivel(ctx, 'redencao')).toBe(true);
    ctx.vampiro.registro.push('viajanteFim:um mercador');
    expect(disponivel(ctx, 'redencao')).toBe(false);
  });

  it('senhor da vila precisa de poder e de mortes', () => {
    const ctx = contexto();
    ctx.vampiro.essencia = 20;
    expect(disponivel(ctx, 'senhorDaVila')).toBe(false);
    ctx.relacoes.mortos.push('bento', 'tonho');
    expect(disponivel(ctx, 'senhorDaVila')).toBe(true);
  });
});
