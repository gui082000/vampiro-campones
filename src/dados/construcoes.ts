import type { IdItem } from './itens';

export interface DefinicaoDeConstrucao {
  nome: string;
  descricao: string;
  onde: 'campo' | 'casa'; // no campo (tem terreno no mapa) ou melhoria dentro da casa
  moedas: number;
  materiais: Partial<Record<IdItem, number>>;
}

// O que dá para construir. Onde ficam as do campo: dados/mundo (LOCAIS_DE_CONSTRUCAO).
export const CONSTRUCOES = {
  galinheiro: {
    nome: 'Galinheiro',
    descricao: 'Abriga até 4 galinhas. Alimentadas, botam um ovo por dia.',
    onde: 'campo',
    moedas: 150,
    materiais: { madeira: 20, pedra: 10 },
  },
  celeiro: {
    nome: 'Celeiro',
    descricao: 'Abriga até 2 vacas. Alimentadas, dão leite todo dia.',
    onde: 'campo',
    moedas: 400,
    materiais: { madeira: 50, pedra: 25 },
  },
  poco: {
    nome: 'Poço',
    descricao: 'Água para o regador, pertinho da plantação.',
    onde: 'campo',
    moedas: 50,
    materiais: { madeira: 5, pedra: 20 },
  },
  pasto: {
    nome: 'Cerca do pasto',
    descricao: 'Os animais pastam soltos e não precisam do comedouro (menos no inverno).',
    onde: 'campo',
    moedas: 80,
    materiais: { madeira: 30 },
  },
  cama: {
    nome: 'Cama de madeira',
    descricao: 'Dormir nela recupera toda a energia (na palha, só 80%).',
    onde: 'casa',
    moedas: 40,
    materiais: { madeira: 15 },
  },
  cozinha: {
    nome: 'Cozinha',
    descricao: 'Permite cozinhar pratos que dão muita energia e valem mais.',
    onde: 'casa',
    moedas: 150,
    materiais: { madeira: 25, pedra: 15 },
  },
  deposito: {
    nome: 'Depósito',
    descricao: 'Um baú com 24 espaços para guardar coisas.',
    onde: 'casa',
    moedas: 30,
    materiais: { madeira: 20 },
  },
  porao: {
    nome: 'Porão reformado',
    descricao: 'Abre o alçapão: um esconderijo com caixão (dormir de dia), cofre e o altar dos poderes.',
    onde: 'casa',
    moedas: 120,
    materiais: { madeira: 20, pedra: 30 },
  },
} satisfies Record<string, DefinicaoDeConstrucao>;

export type IdConstrucao = keyof typeof CONSTRUCOES;

export function definicaoDaConstrucao(id: IdConstrucao): DefinicaoDeConstrucao {
  return CONSTRUCOES[id];
}
