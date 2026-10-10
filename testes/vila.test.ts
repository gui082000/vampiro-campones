import { describe, expect, it } from 'vitest';
import { INTERIORES, type DefinicaoDeInterior } from '../src/dados/interiores';
import { CEMITERIO, PREDIOS } from '../src/dados/vila';

describe('Dados da vila', () => {
  it('cada porta fica na parede de baixo do seu prédio', () => {
    for (const [id, p] of Object.entries(PREDIOS)) {
      const { coluna, linha, colunas, linhas } = p.area;
      expect(p.porta.linha, id).toBe(linha + linhas - 1);
      expect(p.porta.coluna >= coluna && p.porta.coluna < coluna + colunas, id).toBe(true);
    }
  });

  it('todo prédio ou tem sala por dentro ou explica por que está trancado', () => {
    for (const [id, p] of Object.entries(PREDIOS)) {
      expect(Boolean(p.interior) || Boolean(p.trancado), id).toBe(true);
      if (p.interior) expect(INTERIORES[p.interior], id).toBeDefined();
    }
  });

  it('os móveis cabem dentro das salas, sem tapar a porta', () => {
    for (const [id, sala] of Object.entries(INTERIORES) as [string, DefinicaoDeInterior][]) {
      const largura = sala.colunas - 2;
      const altura = sala.linhas - 2;
      const portaColuna = Math.floor(sala.colunas / 2) - 1; // em coordenadas sem parede
      for (const m of sala.moveis) {
        expect(m.coluna + m.colunas <= largura && m.linha + m.linhas <= altura, `${id}: ${m.nome}`).toBe(true);
        const tapaAPorta = m.linha + m.linhas === altura && m.coluna <= portaColuna && portaColuna < m.coluna + m.colunas;
        expect(tapaAPorta, `${id}: ${m.nome}`).toBe(false);
      }
    }
  });

  it('o cemitério tem lápides para ler', () => {
    expect(CEMITERIO.lapides.length).toBeGreaterThan(3);
  });
});
