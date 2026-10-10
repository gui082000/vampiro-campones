// Salas por dentro dos prédios. Tamanho em células contando as paredes (a porta fica
// no meio da parede de baixo). Os móveis têm posição dentro da sala, sem contar as
// paredes (coluna 0, linha 0 = primeiro canto livre). Um móvel com `texto` mostra
// esse texto ao ser usado; os que têm função (cama, balcão...) são ligados pelos sistemas.

export type EstiloDeSala = 'madeira' | 'pedra' | 'taverna';

export type TipoDeMovel =
  | 'cama'
  | 'mesa'
  | 'fogao'
  | 'bau'
  | 'alcapao'
  | 'balcaoDaLoja'
  | 'balcao'
  | 'altar'
  | 'banco'
  | 'estante'
  | 'lareira'
  | 'barril';

export interface Movel {
  tipo: TipoDeMovel;
  nome: string;
  coluna: number;
  linha: number;
  colunas: number;
  linhas: number;
  texto?: string;
}

export interface DefinicaoDeInterior {
  nome: string;
  colunas: number;
  linhas: number;
  estilo: EstiloDeSala;
  moveis: Movel[];
}

// Casa simples de aldeão (os moradores chegam na Fase 3)
function casaSimples(nome: string, textoDaEstante: string): DefinicaoDeInterior {
  return {
    nome,
    colunas: 10,
    linhas: 8,
    estilo: 'madeira',
    moveis: [
      { tipo: 'cama', nome: 'Cama', coluna: 0, linha: 0, colunas: 2, linhas: 2, texto: 'Não é a sua cama.' },
      { tipo: 'mesa', nome: 'Mesa', coluna: 4, linha: 2, colunas: 2, linhas: 1, texto: 'Pratos limpos e um pão dormido.' },
      { tipo: 'estante', nome: 'Estante', coluna: 6, linha: 0, colunas: 2, linhas: 1, texto: textoDaEstante },
      { tipo: 'lareira', nome: 'Lareira', coluna: 3, linha: 0, colunas: 2, linhas: 1, texto: 'As brasas ainda estão mornas.' },
    ],
  };
}

export const INTERIORES = {
  casaDoTomas: {
    nome: 'Casa do Tomás',
    colunas: 10,
    linhas: 8,
    estilo: 'madeira',
    moveis: [
      { tipo: 'cama', nome: 'Cama', coluna: 0, linha: 0, colunas: 2, linhas: 2 },
      { tipo: 'mesa', nome: 'Mesa', coluna: 4, linha: 2, colunas: 2, linhas: 1 },
      { tipo: 'fogao', nome: 'Fogão', coluna: 6, linha: 0, colunas: 2, linhas: 1 },
      { tipo: 'bau', nome: 'Baú', coluna: 3, linha: 0, colunas: 1, linhas: 1 },
      { tipo: 'alcapao', nome: 'Alçapão do porão', coluna: 7, linha: 4, colunas: 1, linhas: 1 },
    ],
  },
  igreja: {
    nome: 'Igreja de Vale Cinzento',
    colunas: 12,
    linhas: 12,
    estilo: 'pedra',
    moveis: [
      { tipo: 'altar', nome: 'Altar', coluna: 4, linha: 0, colunas: 2, linhas: 1, texto: 'Velas recém-acesas. Alguém reza por alguém todas as noites.' },
      { tipo: 'banco', nome: 'Banco', coluna: 1, linha: 3, colunas: 3, linhas: 1, texto: 'Um banco de madeira gasto.' },
      { tipo: 'banco', nome: 'Banco', coluna: 6, linha: 3, colunas: 3, linhas: 1, texto: 'Um banco de madeira gasto.' },
      { tipo: 'banco', nome: 'Banco', coluna: 1, linha: 5, colunas: 3, linhas: 1, texto: 'Um banco de madeira gasto.' },
      { tipo: 'banco', nome: 'Banco', coluna: 6, linha: 5, colunas: 3, linhas: 1, texto: 'Um banco de madeira gasto.' },
      { tipo: 'estante', nome: 'Livro de registros', coluna: 9, linha: 0, colunas: 1, linhas: 1, texto: 'Batismos, casamentos... e uma lista longa de "desaparecidos na floresta".' },
    ],
  },
  taverna: {
    nome: 'Taverna da Rosália',
    colunas: 12,
    linhas: 9,
    estilo: 'taverna',
    moveis: [
      { tipo: 'balcao', nome: 'Balcão', coluna: 0, linha: 1, colunas: 4, linhas: 1, texto: 'Ninguém atrás do balcão. A Rosália chega na Fase 3.' },
      { tipo: 'barril', nome: 'Barril', coluna: 0, linha: 0, colunas: 1, linhas: 1, texto: 'Cheiro forte de cerveja de cevada.' },
      { tipo: 'mesa', nome: 'Mesa', coluna: 5, linha: 2, colunas: 2, linhas: 1, texto: 'Canecas vazias e um baralho velho.' },
      { tipo: 'mesa', nome: 'Mesa', coluna: 8, linha: 4, colunas: 2, linhas: 1, texto: 'Alguém riscou na madeira: "não saia depois do sino".' },
      { tipo: 'lareira', nome: 'Lareira', coluna: 7, linha: 0, colunas: 2, linhas: 1, texto: 'O fogo nunca apaga aqui.' },
    ],
  },
  loja: {
    nome: 'Loja da vila',
    colunas: 10,
    linhas: 8,
    estilo: 'madeira',
    moveis: [
      { tipo: 'balcaoDaLoja', nome: 'Balcão da loja', coluna: 2, linha: 1, colunas: 4, linhas: 1 },
      { tipo: 'estante', nome: 'Prateleira', coluna: 0, linha: 0, colunas: 2, linhas: 1, texto: 'Sacos de sementes, cordas, pregos.' },
      { tipo: 'estante', nome: 'Prateleira', coluna: 6, linha: 0, colunas: 2, linhas: 1, texto: 'Ferramentas penduradas. Mais na Fase 3.' },
      { tipo: 'barril', nome: 'Barril', coluna: 7, linha: 4, colunas: 1, linhas: 1, texto: 'Cheio de batatas.' },
    ],
  },
  casaDaHelena: {
    nome: 'Casa da Helena',
    colunas: 10,
    linhas: 8,
    estilo: 'madeira',
    moveis: [
      { tipo: 'estante', nome: 'Ervas secando', coluna: 0, linha: 0, colunas: 3, linhas: 1, texto: 'Maços de ervas pendurados. Algumas você nunca viu.' },
      { tipo: 'mesa', nome: 'Mesa de remédios', coluna: 4, linha: 2, colunas: 2, linhas: 1, texto: 'Frascos, pilão e um caderno de anotações fechado.' },
      { tipo: 'cama', nome: 'Cama', coluna: 6, linha: 0, colunas: 2, linhas: 2, texto: 'Bem arrumada.' },
      { tipo: 'lareira', nome: 'Caldeirão', coluna: 4, linha: 0, colunas: 1, linhas: 1, texto: 'Um chá amargo ainda quente.' },
    ],
  },
  casaDoPadre: casaSimples('Casa paroquial', 'Livros de orações e uma cruz de ferro sobre a porta.'),
  casaDoFerreiro: casaSimples('Casa do ferreiro', 'Pinças e ferraduras. Cheiro de carvão.'),
  casaDaViuva: casaSimples('Casa da viúva', 'O retrato de um homem, virado para a parede.'),
  casaDoAgricultor: casaSimples('Casa do agricultor', 'Almanaques de colheita, todos marcados.'),
  casaDoBento: casaSimples('Casa do Bento', 'Um bilhete: "Tomás, aparece pra jantar. — Bento".'),
  cabanaDoOrlando: {
    nome: 'Cabana do caçador',
    colunas: 9,
    linhas: 7,
    estilo: 'madeira',
    moveis: [
      { tipo: 'estante', nome: 'Armadilhas', coluna: 0, linha: 0, colunas: 2, linhas: 1, texto: 'Armadilhas de ferro, bem cuidadas. Grandes demais para lobo.' },
      { tipo: 'mesa', nome: 'Mesa', coluna: 3, linha: 2, colunas: 2, linhas: 1, texto: 'Um mapa da floresta com marcas vermelhas.' },
      { tipo: 'cama', nome: 'Catre', coluna: 6, linha: 0, colunas: 1, linhas: 2, texto: 'Duro e frio.' },
    ],
  },
} satisfies Record<string, DefinicaoDeInterior>;

export type IdInterior = keyof typeof INTERIORES;
