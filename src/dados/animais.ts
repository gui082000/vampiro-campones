import type { IdItem } from './itens';

export type Abrigo = 'galinheiro' | 'celeiro';

export interface DefinicaoDeEspecie {
  nome: string;
  preco: number; // comprado no próprio abrigo
  produto: IdItem; // o que dá por dia, se tiver comido
  abrigo: Abrigo;
  nomes: string[]; // nomes sorteados para cada animal comprado
  cor: number; // arte provisória
  tamanho: number; // em pixels
}

export const ESPECIES = {
  galinha: {
    nome: 'Galinha',
    preco: 60,
    produto: 'ovo',
    abrigo: 'galinheiro',
    nomes: ['Pintada', 'Carijó', 'Penosa', 'Ruiva', 'Cocota', 'Branquinha'],
    cor: 0xf2efe6,
    tamanho: 12,
  },
  vaca: {
    nome: 'Vaca',
    preco: 200,
    produto: 'leite',
    abrigo: 'celeiro',
    nomes: ['Mimosa', 'Estrela', 'Malhada', 'Boneca'],
    cor: 0xe8e0d0,
    tamanho: 24,
  },
} satisfies Record<string, DefinicaoDeEspecie>;

export type Especie = keyof typeof ESPECIES;

export function definicaoDaEspecie(especie: Especie): DefinicaoDeEspecie {
  return ESPECIES[especie];
}

export const ESPECIE_DO_ABRIGO: Record<Abrigo, Especie> = { galinheiro: 'galinha', celeiro: 'vaca' };

// Quantos animais cabem em cada abrigo e quanta comida cabe no comedouro
export const CAPACIDADE_DO_ABRIGO: Record<Abrigo, number> = { galinheiro: 4, celeiro: 2 };
export const CAPACIDADE_DO_COMEDOURO = 12; // porções; cada animal come 1 por dia
