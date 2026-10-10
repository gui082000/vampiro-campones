import type { Estacao } from './estacoes';
import type { IdItem } from './itens';

// Quando a planta cresce: o tempo todo, só com sol (6h às 19h) ou só no escuro.
export type QuandoCresce = 'sempre' | 'dia' | 'noite';

export interface DefinicaoDePlanta {
  nome: string;
  semente: IdItem;
  colheita: IdItem;
  quantidade: number; // quantos itens dá cada colheita
  estacoes: Estacao[]; // fora delas não dá para plantar, e o que estiver plantado morre
  cresce: QuandoCresce;
  horas: number; // horas do jogo crescendo (regada) até ficar pronta
  cor: number; // cor da planta madura (arte provisória)
}

// Cada planta só cresce nas horas em que está regada. A terra seca todo dia às 6h.
// Um dia tem 13 horas de sol (6h às 19h) e 11 de noite.
export const PLANTAS = {
  trigo: { nome: 'Trigo', semente: 'sementeTrigo', colheita: 'trigo', quantidade: 3, estacoes: ['primavera', 'verao'], cresce: 'sempre', horas: 36, cor: 0xe0c060 },
  batata: { nome: 'Batata', semente: 'sementeBatata', colheita: 'batata', quantidade: 3, estacoes: ['primavera'], cresce: 'sempre', horas: 60, cor: 0xb8905a },
  tomate: { nome: 'Tomate', semente: 'sementeTomate', colheita: 'tomate', quantidade: 4, estacoes: ['verao'], cresce: 'sempre', horas: 48, cor: 0xd84030 },
  milho: { nome: 'Milho', semente: 'sementeMilho', colheita: 'milho', quantidade: 3, estacoes: ['verao', 'outono'], cresce: 'sempre', horas: 72, cor: 0xf0d040 },
  girassol: { nome: 'Girassol', semente: 'sementeGirassol', colheita: 'girassol', quantidade: 1, estacoes: ['verao'], cresce: 'dia', horas: 39, cor: 0xf0b020 },
  abobora: { nome: 'Abóbora', semente: 'sementeAbobora', colheita: 'abobora', quantidade: 1, estacoes: ['outono'], cresce: 'sempre', horas: 96, cor: 0xe8801a },
  repolho: { nome: 'Repolho', semente: 'sementeRepolho', colheita: 'repolho', quantidade: 1, estacoes: ['inverno'], cresce: 'sempre', horas: 72, cor: 0x90c070 },
  lirio: { nome: 'Lírio-da-lua', semente: 'sementeLirio', colheita: 'lirioDaLua', quantidade: 1, estacoes: ['primavera', 'verao', 'outono', 'inverno'], cresce: 'noite', horas: 33, cor: 0xc8c0f0 },
} satisfies Record<string, DefinicaoDePlanta>;

export type IdPlanta = keyof typeof PLANTAS;

export function definicaoDaPlanta(id: IdPlanta): DefinicaoDePlanta {
  return PLANTAS[id];
}

// Qual planta nasce de um item, se ele for uma semente
export function plantaDaSemente(item: IdItem): IdPlanta | undefined {
  return (Object.keys(PLANTAS) as IdPlanta[]).find((id) => PLANTAS[id].semente === item);
}
