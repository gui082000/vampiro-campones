// As quatro estações, na ordem do calendário.
export const ESTACOES = ['primavera', 'verao', 'outono', 'inverno'] as const;

export type Estacao = (typeof ESTACOES)[number];

export const NOME_ESTACAO: Record<Estacao, string> = {
  primavera: 'Primavera',
  verao: 'Verão',
  outono: 'Outono',
  inverno: 'Inverno',
};

// Aviso no primeiro dia de cada estação
export const CHEGADA_DA_ESTACAO: Record<Estacao, string> = {
  primavera: 'Chegou a primavera',
  verao: 'Chegou o verão',
  outono: 'Chegou o outono',
  inverno: 'Chegou o inverno',
};

// Para frases como "não cresce no verão"
export const NA_ESTACAO: Record<Estacao, string> = {
  primavera: 'na primavera',
  verao: 'no verão',
  outono: 'no outono',
  inverno: 'no inverno',
};
