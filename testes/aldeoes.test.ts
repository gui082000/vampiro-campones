import { describe, expect, it } from 'vitest';
import { ALDEOES, type DefinicaoDeAldeao, type IdAldeao } from '../src/dados/aldeoes';
import { MISSOES } from '../src/dados/missoes';
import { Diario } from '../src/estado/Diario';
import { Inventario } from '../src/estado/Inventario';
import { aceitar, entregar, missaoAtiva, missaoDisponivel, podeEntregar } from '../src/estado/Missoes';
import { Missoes } from '../src/estado/Missoes';
import { PONTOS_POR_CORACAO, Relacoes, conversar, presentear } from '../src/estado/Relacoes';

describe('Aldeões e amizade', () => {
  it('conversar sobe a amizade só uma vez por dia', () => {
    const r = new Relacoes();
    conversar(r, 'bento', 1);
    conversar(r, 'bento', 1);
    const depois = r.porAldeao.bento.pontos;
    expect(depois).toBeGreaterThan(0);
    r.novoDia();
    conversar(r, 'bento', 2);
    expect(r.porAldeao.bento.pontos).toBe(depois * 2);
  });

  it('a fala muda com a amizade', () => {
    const r = new Relacoes();
    const primeiras: string[] = ALDEOES.helena.falas[0];
    expect(primeiras).toContain(conversar(r, 'helena', 1));
    r.somar('helena', 9 * PONTOS_POR_CORACAO);
    const ultimas: string[] = ALDEOES.helena.falas[3];
    expect(ultimas).toContain(conversar(r, 'helena', 1));
  });

  it('presente de que gosta vale mais; um por dia', () => {
    const r = new Relacoes();
    const inv = new Inventario([{ item: 'ervaMedicinal', qtd: 2 }]);
    expect(presentear(r, 'helena', inv).mudou).toBe(true);
    const comGosto = r.porAldeao.helena.pontos;
    expect(presentear(r, 'helena', inv).mudou).toBe(false);

    const outro = new Relacoes();
    presentear(outro, 'helena', new Inventario([{ item: 'pedra', qtd: 1 }]));
    expect(comGosto).toBeGreaterThan(outro.porAldeao.helena.pontos);
  });

  it('amizade fica entre 0 e 10 corações', () => {
    const r = new Relacoes();
    r.somar('orlando', -50);
    expect(r.coracoes('orlando')).toBe(0);
    r.somar('orlando', 500);
    expect(r.coracoes('orlando')).toBe(10);
  });

  it('cada aldeão tem rotina começando na hora 0 e falas', () => {
    for (const [id, a] of Object.entries(ALDEOES) as [IdAldeao, DefinicaoDeAldeao][]) {
      expect(a.rotina[0][0], id).toBe(0);
      expect(a.falas.flat().length, id).toBeGreaterThan(0);
    }
  });
});

describe('Missões', () => {
  it('cada aldeão principal tem pelo menos 3 missões', () => {
    for (const [id, a] of Object.entries(ALDEOES) as [IdAldeao, DefinicaoDeAldeao][]) {
      if (!a.principal) continue;
      expect(Object.values(MISSOES).filter((m) => m.aldeao === id).length, id).toBeGreaterThanOrEqual(3);
    }
  });

  it('aceitar, entregar e liberar a próxima conforme a amizade', () => {
    const missoes = new Missoes();
    const relacoes = new Relacoes();
    const inv = new Inventario([{ item: 'trigo', qtd: 5 }]);
    const moedas = inv.moedas;

    expect(missaoDisponivel(missoes, relacoes, 'bento')).toBe('bento1');
    aceitar(missoes, 'bento1');
    expect(missaoAtiva(missoes, 'bento')).toBe('bento1');
    expect(missaoDisponivel(missoes, relacoes, 'bento')).toBeNull();
    expect(podeEntregar('bento1', inv)).toBe(true);

    entregar(missoes, 'bento1', inv, relacoes);
    expect(inv.tem('trigo')).toBe(false);
    expect(inv.moedas).toBe(moedas + MISSOES.bento1.moedas);
    expect(missoes.concluidas()).toEqual(['bento1']);

    // a segunda pede mais amizade
    relacoes.porAldeao.bento.pontos = 0;
    expect(missaoDisponivel(missoes, relacoes, 'bento')).toBeNull();
    relacoes.somar('bento', MISSOES.bento2.coracoes * PONTOS_POR_CORACAO);
    expect(missaoDisponivel(missoes, relacoes, 'bento')).toBe('bento2');
  });

  it('não entrega sem os itens', () => {
    const missoes = new Missoes();
    aceitar(missoes, 'orlando1');
    expect(entregar(missoes, 'orlando1', new Inventario([]), new Relacoes()).mudou).toBe(false);
  });

  it('o diário não repete pistas', () => {
    const d = new Diario();
    expect(d.anotar('a')).toBe(true);
    expect(d.anotar('a')).toBe(false);
    expect(d.pistas).toEqual(['a']);
  });
});
