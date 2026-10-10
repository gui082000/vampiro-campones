import type { IdItem } from './itens';

// O que a loja da vila vende além das sementes da estação, e por quanto
export const OUTROS_ITENS_DA_LOJA: { item: IdItem; preco: number }[] = [
  { item: 'feno', preco: 6 },
  { item: 'adubo', preco: 10 },
  { item: 'madeira', preco: 5 },
  { item: 'pedra', preco: 5 },
  { item: 'pao', preco: 30 },
  { item: 'varaDePesca', preco: 60 },
];

// Horário da loja (a Dona Cida fica atrás do balcão)
export const LOJA_ABRE = 8;
export const LOJA_FECHA = 18;
