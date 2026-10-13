import type { Estacao } from './estacoes';
import type { IdItem } from './itens';

// O tempo de cada dia, sorteado na virada do dia.
export const TEMPOS = {
  sol: { nome: 'Sol', aviso: '' },
  chuva: { nome: 'Chuva', aviso: 'Está chovendo. A chuva regou a plantação.' },
  neblina: { nome: 'Neblina', aviso: 'Uma neblina grossa cobre a vila. Ninguém enxerga longe hoje.' },
  tempestade: { nome: 'Tempestade', aviso: 'Tempestade! A plantação está regada e ninguém vai para a estrada.' },
} as const;

export type Tempo = keyof typeof TEMPOS;

// Chance de cada tempo por estação (somam 1)
export const CHANCES_DO_TEMPO: Record<Estacao, Record<Tempo, number>> = {
  primavera: { sol: 0.55, chuva: 0.3, neblina: 0.1, tempestade: 0.05 },
  verao: { sol: 0.65, chuva: 0.15, neblina: 0.05, tempestade: 0.15 },
  outono: { sol: 0.4, chuva: 0.25, neblina: 0.3, tempestade: 0.05 },
  inverno: { sol: 0.45, chuva: 0.1, neblina: 0.4, tempestade: 0.05 },
};

// Fases da lua: um ciclo de 8 dias. Na lua cheia o vampiro é mais forte e mais faminto.
export const FASES_DA_LUA = [
  'Lua nova',
  'Lua crescente',
  'Quarto crescente',
  'Lua quase cheia',
  'Lua cheia',
  'Lua minguante',
  'Quarto minguante',
  'Lua velha',
] as const;
export const LUA_CHEIA = 4; // posição na lista acima

// Coisas pequenas que podem acontecer de manhã. `soSeJaMordeu`: só depois da primeira mordida.
export interface EventoAleatorio {
  texto: string;
  moedas?: number;
  energia?: number;
  suspeita?: number;
  item?: { id: IdItem; qtd: number };
  soSeJaMordeu?: boolean;
}

export const EVENTOS_ALEATORIOS: EventoAleatorio[] = [
  { texto: 'Um corvo deixou uma moeda brilhante na janela.', moedas: 15 },
  { texto: 'Um mascate passou pela estrada e deixou sementes de presente.', item: { id: 'sementeTrigo', qtd: 5 } },
  { texto: 'Você acordou com dor de cabeça. O sono foi ruim.', energia: -15 },
  { texto: 'Uma raposa rondou os galinheiros à noite. A vila culpa os bichos do mato.', suspeita: -4 },
  { texto: 'O padre achou um rato seco, sem sangue, na sacristia. A vila comenta.', suspeita: 4, soSeJaMordeu: true },
  { texto: 'Cogumelos brotaram perto da porta durante a noite.', item: { id: 'cogumelo', qtd: 2 } },
];

// Um festival por estação, num dia fixo. O Tomás participa na praça da igreja.
export interface Festival {
  nome: string;
  diaDaEstacao: number;
  convite: string;
  participar: string;
  presente: { id: IdItem; qtd: number };
}

export const FESTIVAIS: Record<Estacao, Festival> = {
  primavera: {
    nome: 'Festa da Semeadura',
    diaDaEstacao: 7,
    convite: 'Hoje é a Festa da Semeadura! A vila se reúne em frente à igreja.',
    participar: 'Você benze as sementes com a vila. Dona Rosália põe um saquinho na sua mão.',
    presente: { id: 'sementeAbobora', qtd: 3 },
  },
  verao: {
    nome: 'Fogueira de São João',
    diaDaEstacao: 7,
    convite: 'Hoje tem Fogueira de São João em frente à igreja.',
    participar: 'Você dança em volta da fogueira, longe o bastante do fogo. Te dão pão quente.',
    presente: { id: 'pao', qtd: 3 },
  },
  outono: {
    nome: 'Festa da Colheita',
    diaDaEstacao: 7,
    convite: 'Hoje é a Festa da Colheita! Mesas fartas em frente à igreja.',
    participar: 'Você divide a mesa com a vila. Ninguém repara que você não come.',
    presente: { id: 'tortaDeAbobora', qtd: 1 },
  },
  inverno: {
    nome: 'Vigília das Almas',
    diaDaEstacao: 7,
    convite: 'Hoje é a Vigília das Almas. Velas em frente à igreja pelos que se foram.',
    participar: 'Você acende uma vela com a vila. Por um instante, se sente parte dela.',
    presente: { id: 'ervaMedicinal', qtd: 4 },
  },
};

// Onde fica a festa (na frente da igreja) e em que horas dá para participar
export const LUGAR_DO_FESTIVAL = { coluna: 163, linha: 81 };
export const HORARIO_DO_FESTIVAL = [9, 22];

// Para onde o morcego voa (célula onde o Tomás pousa)
export const POUSOS_DO_MORCEGO = [
  { nome: 'Casa', coluna: 106, linha: 15 },
  { nome: 'Vila (igreja)', coluna: 158, linha: 82 },
  { nome: 'Cemitério', coluna: 144, linha: 110 },
  { nome: 'Floresta', coluna: 170, linha: 26 },
  { nome: 'Estrada', coluna: 118, linha: 81 },
];
