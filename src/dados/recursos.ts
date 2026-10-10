import type { Estacao } from './estacoes';
import type { IdItem } from './itens';

export interface DefinicaoDeRecurso {
  nome: string;
  ferramenta: IdItem | null; // null: dá para pegar com qualquer coisa na mão
  golpes: number; // quantos usos até soltar os itens
  energia: number; // energia gasta a cada uso
  solta: { item: IdItem; min: number; max: number }[];
  diasParaVoltar: number; // depois de colhido, quantos dias até reaparecer
  estacoes?: Estacao[]; // só aparece (ou só dá fruto) nessas estações
  permanente?: boolean; // não some ao ser colhido, só perde os frutos (arbusto)
  solido: boolean; // bloqueia a passagem
}

// Recursos espalhados pelo campo. Onde e quantos aparecem fica em dados/mundo.
export const RECURSOS = {
  arvore: {
    nome: 'Árvore',
    ferramenta: 'machado',
    golpes: 3,
    energia: 3,
    solta: [{ item: 'madeira', min: 3, max: 5 }, { item: 'fibra', min: 0, max: 1 }],
    diasParaVoltar: 4,
    solido: true,
  },
  pedra: {
    nome: 'Pedra',
    ferramenta: 'picareta',
    golpes: 2,
    energia: 3,
    solta: [{ item: 'pedra', min: 2, max: 4 }],
    diasParaVoltar: 3,
    solido: true,
  },
  mato: {
    nome: 'Mato',
    ferramenta: null,
    golpes: 1,
    energia: 1,
    solta: [{ item: 'fibra', min: 1, max: 2 }],
    diasParaVoltar: 1,
    solido: false,
  },
  arbusto: {
    nome: 'Arbusto de amora',
    ferramenta: null,
    golpes: 1,
    energia: 0,
    solta: [{ item: 'amora', min: 1, max: 3 }],
    diasParaVoltar: 2,
    estacoes: ['primavera', 'verao'],
    permanente: true,
    solido: false,
  },
  erva: {
    nome: 'Erva medicinal',
    ferramenta: null,
    golpes: 1,
    energia: 0,
    solta: [{ item: 'ervaMedicinal', min: 1, max: 1 }],
    diasParaVoltar: 2,
    solido: false,
  },
  cogumelo: {
    nome: 'Cogumelo',
    ferramenta: null,
    golpes: 1,
    energia: 0,
    solta: [{ item: 'cogumelo', min: 1, max: 2 }],
    diasParaVoltar: 2,
    estacoes: ['outono'],
    solido: false,
  },
} satisfies Record<string, DefinicaoDeRecurso>;

export type TipoDeRecurso = keyof typeof RECURSOS;

export function definicaoDoRecurso(tipo: TipoDeRecurso): DefinicaoDeRecurso {
  return RECURSOS[tipo];
}
