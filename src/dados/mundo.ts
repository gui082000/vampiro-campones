import type { AreaDeCelulas } from '../util/areas';
import type { IdConstrucao } from './construcoes';
import type { Abrigo } from './animais';
import type { TipoDeRecurso } from './recursos';

// Onde as coisas ficam no mapa, em células da grade do RPG Map 2 (cada célula tem
// 32 px; a coluna conta da esquerda, a linha conta de cima). Áreas são dadas pela
// célula do canto superior esquerdo e pelo tamanho. Para mover algo, troque os números.

// Célula onde o Tomás aparece no começo: na frente da casa do camponês
export const INICIO_JOGADOR = { coluna: 106, linha: 15 };

// Porta da casa (na parede de baixo): dormir, melhorias, cozinha e depósito
export const PORTA_DA_CASA: AreaDeCelulas = { coluna: 106, linha: 13, colunas: 1, linhas: 1 };

// O campo cercado ao lado da casa, onde dá para arar e plantar. A parte da esquerda
// tem entrada pelo vão da cerca do meio (linhas 25-26); a da direita, pelo alto (101-102).
export const AREAS_DE_PLANTIO: AreaDeCelulas[] = [
  { coluna: 91, linha: 19, colunas: 8, linhas: 12 },
  { coluna: 100, linha: 19, colunas: 4, linhas: 12 },
];

// Estações provisórias no pátio da casa, até a vila existir (Fase 2)
export const BARRACA_DE_SEMENTES: AreaDeCelulas = { coluna: 97, linha: 13, colunas: 2, linhas: 3 };
export const CAIXA_DE_VENDA: AreaDeCelulas = { coluna: 103, linha: 14, colunas: 2, linhas: 1 };
export const BANCADA: AreaDeCelulas = { coluna: 100, linha: 12, colunas: 2, linhas: 1 };

// Terrenos para as construções do campo (antes de construir, aparece só a marcação)
export const LOCAIS_DE_CONSTRUCAO: Partial<Record<IdConstrucao, AreaDeCelulas>> = {
  poco: { coluna: 94, linha: 15, colunas: 2, linhas: 2 },
  galinheiro: { coluna: 113, linha: 17, colunas: 3, linhas: 3 },
  celeiro: { coluna: 119, linha: 16, colunas: 4, linhas: 4 },
  pasto: { coluna: 112, linha: 21, colunas: 14, linhas: 8 },
};

// Onde os animais andam enquanto não houver a cerca do pasto (aí andam pelo pasto todo)
export const QUINTAL: Record<Abrigo, AreaDeCelulas> = {
  galinheiro: { coluna: 112, linha: 21, colunas: 5, linhas: 3 },
  celeiro: { coluna: 118, linha: 21, colunas: 6, linhas: 4 },
};

// Onde nascem árvores, pedras, mato, amoras, ervas e cogumelos, e quantos de cada.
// As células exatas são sorteadas (sempre as mesmas) só em lugares livres.
export const AREAS_DE_RECURSOS: { tipo: TipoDeRecurso; quantidade: number; area: AreaDeCelulas }[] = [
  { tipo: 'arvore', quantidade: 12, area: { coluna: 112, linha: 11, colunas: 19, linhas: 6 } },
  { tipo: 'erva', quantidade: 5, area: { coluna: 112, linha: 11, colunas: 19, linhas: 6 } },
  { tipo: 'cogumelo', quantidade: 4, area: { coluna: 112, linha: 11, colunas: 19, linhas: 6 } },
  { tipo: 'pedra', quantidade: 8, area: { coluna: 126, linha: 17, colunas: 5, linhas: 12 } },
  { tipo: 'arbusto', quantidade: 4, area: { coluna: 126, linha: 17, colunas: 5, linhas: 12 } },
  { tipo: 'mato', quantidade: 10, area: { coluna: 109, linha: 17, colunas: 3, linhas: 13 } },
];

// Semente do sorteio das posições: mudar o número muda onde os recursos aparecem
export const SEMENTE_DOS_RECURSOS = 2026;
