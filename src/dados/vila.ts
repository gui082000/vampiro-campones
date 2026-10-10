import type { AreaDeCelulas } from '../util/areas';
import type { IdInterior } from './interiores';

// Prédios do mundo. A área é o bloco que já existe no mapa (bloqueado); o jogo desenha
// o prédio por cima. A porta fica na parede de baixo: o Tomás entra olhando para ela.
export type EstiloDePredio = 'casa' | 'igreja' | 'taverna' | 'loja' | 'solar' | 'cabana' | 'ruina' | 'armazem';

export interface Predio {
  nome: string;
  area: AreaDeCelulas;
  porta: { coluna: number; linha: number };
  estilo: EstiloDePredio;
  interior?: IdInterior;
  trancado?: string; // mensagem quando a porta não abre
}

export const PREDIOS: Record<string, Predio> = {
  casaDoTomas: {
    nome: 'Casa do Tomás',
    area: { coluna: 105, linha: 6, colunas: 7, linhas: 8 },
    porta: { coluna: 106, linha: 13 },
    estilo: 'casa',
    interior: 'casaDoTomas',
  },
  igreja: {
    nome: 'Igreja',
    area: { coluna: 152, linha: 70, colunas: 13, linhas: 10 },
    porta: { coluna: 158, linha: 79 },
    estilo: 'igreja',
    interior: 'igreja',
  },
  taverna: {
    nome: 'Taverna',
    area: { coluna: 152, linha: 83, colunas: 10, linhas: 7 },
    porta: { coluna: 156, linha: 89 },
    estilo: 'taverna',
    interior: 'taverna',
  },
  loja: {
    nome: 'Loja',
    area: { coluna: 136, linha: 79, colunas: 10, linhas: 7 },
    porta: { coluna: 140, linha: 85 },
    estilo: 'loja',
    interior: 'loja',
  },
  casaDaHelena: {
    nome: 'Casa da Helena',
    area: { coluna: 124, linha: 84, colunas: 6, linhas: 8 },
    porta: { coluna: 126, linha: 91 },
    estilo: 'casa',
    interior: 'casaDaHelena',
  },
  casaDoPadre: {
    nome: 'Casa paroquial',
    area: { coluna: 140, linha: 70, colunas: 8, linhas: 5 },
    porta: { coluna: 143, linha: 74 },
    estilo: 'casa',
    interior: 'casaDoPadre',
  },
  casaDoFerreiro: {
    nome: 'Ferreiro',
    area: { coluna: 165, linha: 84, colunas: 7, linhas: 6 },
    porta: { coluna: 168, linha: 89 },
    estilo: 'casa',
    interior: 'casaDoFerreiro',
  },
  casaDaViuva: {
    nome: 'Casa da viúva',
    area: { coluna: 136, linha: 91, colunas: 10, linhas: 7 },
    porta: { coluna: 140, linha: 97 },
    estilo: 'casa',
    interior: 'casaDaViuva',
  },
  casaDoBento: {
    nome: 'Casa do Bento',
    area: { coluna: 172, linha: 95, colunas: 9, linhas: 7 },
    porta: { coluna: 176, linha: 101 },
    estilo: 'casa',
    interior: 'casaDoBento',
  },
  casaDoAgricultor: {
    nome: 'Sítio do Seu Amaro',
    area: { coluna: 151, linha: 94, colunas: 16, linhas: 15 },
    porta: { coluna: 158, linha: 108 },
    estilo: 'casa',
    interior: 'casaDoAgricultor',
  },
  armazem: {
    nome: 'Armazém',
    area: { coluna: 124, linha: 101, colunas: 15, linhas: 10 },
    porta: { coluna: 131, linha: 110 },
    estilo: 'armazem',
    trancado: 'O armazém da vila está trancado com cadeado.',
  },
  solar: {
    nome: 'Solar dos Fundadores',
    area: { coluna: 167, linha: 63, colunas: 17, linhas: 18 },
    porta: { coluna: 175, linha: 80 },
    estilo: 'solar',
    trancado: 'Os portões do solar estão fechados. Um brasão antigo: uma colina e uma lua.',
  },
  cabanaDoOrlando: {
    nome: 'Cabana do caçador',
    area: { coluna: 166, linha: 12, colunas: 9, linhas: 8 },
    porta: { coluna: 170, linha: 19 },
    estilo: 'cabana',
    interior: 'cabanaDoOrlando',
  },
  colina: {
    nome: 'Ruínas na colina',
    area: { coluna: 64, linha: 1, colunas: 18, linhas: 17 },
    porta: { coluna: 72, linha: 17 },
    estilo: 'ruina',
    interior: 'salaoDaColina', // só abre no Ato 3 (ver sistemas/Vila)
    trancado: 'Um portão de ferro antigo, preso com correntes. Do outro lado, só escuridão... e um cheiro de terra molhada.',
  },
};

// Cemitério no morro da cidade. As lápides contam a história aos poucos.
export const CEMITERIO = {
  area: { coluna: 140, linha: 100, colunas: 9, linhas: 9 } as AreaDeCelulas,
  lapides: [
    'Joaquim Andrade, tio do Tomás. "Guardou o que não se via." A terra ainda está mexida.',
    'Família Valadares, fundadores. "Por Vale Cinzento, tudo."',
    'Ana, 23 anos. Desaparecida na floresta.',
    'Mateus, 31 anos. Desaparecido na floresta.',
    'Sem nome. Só uma data, de muito tempo atrás.',
    'Clara e Pedro. "Juntos na luz."',
    'Inês, 40 anos. Desaparecida na floresta.',
    'Sebastião, ferreiro. "Forjou até o fim."',
  ],
};

// Placas pelo caminho
export const PLACAS: { coluna: number; linha: number; texto: string }[] = [
  { coluna: 125, linha: 76, texto: 'Vale Cinzento' },
  { coluna: 112, linha: 33, texto: 'Floresta →' },
  { coluna: 73, linha: 20, texto: 'Colina' },
  { coluna: 141, linha: 99, texto: 'Cemitério' },
];
