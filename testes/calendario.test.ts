import { describe, expect, it } from 'vitest';
import { DIAS_POR_ESTACAO, ESTACAO_INICIAL } from '../src/config';
import { ESTACOES, NOME_ESTACAO } from '../src/dados/estacoes';
import { dataDoDia, textoDaData } from '../src/estado/Calendario';

const inicio = ESTACOES.indexOf(ESTACAO_INICIAL);

describe('Calendário', () => {
  it('o dia 1 é o primeiro dia da estação inicial', () => {
    expect(dataDoDia(1)).toEqual({ ano: 1, estacao: ESTACAO_INICIAL, diaDaEstacao: 1 });
  });

  it(`cada estação dura ${DIAS_POR_ESTACAO} dias`, () => {
    expect(dataDoDia(DIAS_POR_ESTACAO).diaDaEstacao).toBe(DIAS_POR_ESTACAO);
    expect(dataDoDia(DIAS_POR_ESTACAO + 1)).toEqual({
      ano: 1,
      estacao: ESTACOES[(inicio + 1) % 4],
      diaDaEstacao: 1,
    });
  });

  it('depois das quatro estações começa outro ano', () => {
    const data = dataDoDia(DIAS_POR_ESTACAO * 4 + 1);
    expect(data.estacao).toBe(ESTACAO_INICIAL);
    expect(data.ano).toBe(2);
  });

  it('escreve a data por extenso', () => {
    expect(textoDaData(3)).toBe(`3 de ${NOME_ESTACAO[ESTACAO_INICIAL]}`);
  });
});
