// Onde as coisas ficam no mapa, em células da grade do RPG Map 2 (cada célula tem
// 32 px; a coluna conta da esquerda, a linha conta de cima). Para mover algo, é só
// trocar os números aqui.

// Célula onde o Tomás aparece no começo: na frente da casa do camponês
export const INICIO_JOGADOR = { coluna: 106, linha: 15 };

// Bloco de canteiros dentro do campo cercado ao lado da casa, a partir da célula do
// canto superior esquerdo. Entra-se no campo pelo vão no alto da cerca (colunas
// 101-102) e depois pelo vão da cerca do meio (linhas 25-26).
export const CAMPO_DE_PLANTIO = { coluna: 95, linha: 22, colunas: 4, linhas: 3 };

// Célula do centro de cada estação. Ficam provisoriamente no pátio da casa,
// até a vila existir (Fase 2).
export const BARRACA_DE_SEMENTES = { coluna: 98, linha: 14 };
export const CAIXA_DE_VENDA = { coluna: 104, linha: 14 };
