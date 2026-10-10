import type { IdItem } from './itens';

export interface Receita {
  resultado: IdItem;
  quantidade: number;
  ingredientes: Partial<Record<IdItem, number>>;
  local: 'bancada' | 'cozinha';
  bloqueada?: boolean; // ainda não aparece para o jogador (desbloqueia mais tarde na história)
}

// Bancada: ferramentas e materiais. Cozinha (melhoria da casa): comidas.
// As receitas do vampiro aparecem depois da primeira mordida.
export const RECEITAS = {
  varaDePesca: { resultado: 'varaDePesca', quantidade: 1, ingredientes: { madeira: 5, fibra: 3 }, local: 'bancada' },
  feno: { resultado: 'feno', quantidade: 2, ingredientes: { fibra: 4 }, local: 'bancada' },
  adubo: { resultado: 'adubo', quantidade: 3, ingredientes: { fibra: 3, madeira: 1 }, local: 'bancada' },
  unguentoSolar: { resultado: 'unguentoSolar', quantidade: 1, ingredientes: { ervaMedicinal: 2, lirioDaLua: 1 }, local: 'bancada', bloqueada: true },
  ervasDeDisfarce: { resultado: 'ervasDeDisfarce', quantidade: 1, ingredientes: { ervaMedicinal: 3, amora: 1 }, local: 'bancada', bloqueada: true },
  tonicoRubro: { resultado: 'tonicoRubro', quantidade: 1, ingredientes: { lirioDaLua: 1, leite: 1 }, local: 'bancada', bloqueada: true },

  pao: { resultado: 'pao', quantidade: 1, ingredientes: { trigo: 3 }, local: 'cozinha' },
  sopaDeLegumes: { resultado: 'sopaDeLegumes', quantidade: 1, ingredientes: { batata: 2, ervaMedicinal: 1 }, local: 'cozinha' },
  omelete: { resultado: 'omelete', quantidade: 1, ingredientes: { ovo: 2 }, local: 'cozinha' },
  tortaDeAbobora: { resultado: 'tortaDeAbobora', quantidade: 1, ingredientes: { abobora: 1, trigo: 2, ovo: 1 }, local: 'cozinha' },
  peixeAssado: { resultado: 'peixeAssado', quantidade: 1, ingredientes: { tilapia: 1, ervaMedicinal: 1 }, local: 'cozinha' },
} satisfies Record<string, Receita>;

export type IdReceita = keyof typeof RECEITAS;

export function definicaoDaReceita(id: IdReceita): Receita {
  return RECEITAS[id];
}
