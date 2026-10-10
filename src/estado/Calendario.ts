import { DIAS_POR_ESTACAO, ESTACAO_INICIAL } from '../config';
import { ESTACOES, NOME_ESTACAO, type Estacao } from '../dados/estacoes';

export interface Data {
  ano: number;
  estacao: Estacao;
  diaDaEstacao: number;
}

// Converte o número do dia do jogo (1, 2, 3...) em estação, dia da estação e ano
export function dataDoDia(dia: number): Data {
  const inicio = ESTACOES.indexOf(ESTACAO_INICIAL);
  const estacoesPassadas = Math.floor((dia - 1) / DIAS_POR_ESTACAO) + inicio;
  return {
    ano: Math.floor(estacoesPassadas / ESTACOES.length) + 1,
    estacao: ESTACOES[estacoesPassadas % ESTACOES.length],
    diaDaEstacao: ((dia - 1) % DIAS_POR_ESTACAO) + 1,
  };
}

export function estacaoDoDia(dia: number): Estacao {
  return dataDoDia(dia).estacao;
}

// Ex.: "3 de Primavera" (e o ano, a partir do segundo)
export function textoDaData(dia: number): string {
  const { ano, estacao, diaDaEstacao } = dataDoDia(dia);
  return `${diaDaEstacao} de ${NOME_ESTACAO[estacao]}${ano > 1 ? `, ano ${ano}` : ''}`;
}
