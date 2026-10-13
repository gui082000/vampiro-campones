// Formas de se alimentar: quanto tiram de fome e quanta essência (para os poderes) dão.
export const ALIMENTOS = {
  animalDaFazenda: { nome: 'animal da fazenda', fome: 15, essencia: 1, descricao: 'Seguro, mas alimenta pouco. O animal fica fraco e não produz amanhã.' },
  cervo: { nome: 'cervo', fome: 35, essencia: 1, descricao: 'Só aparece na floresta à noite.' },
  viajantePouco: { nome: 'viajante (um pouco)', fome: 30, essencia: 2, descricao: 'Ele segue viagem fraco.' },
  viajanteFim: { nome: 'viajante (até o fim)', fome: 60, essencia: 4, descricao: 'Ninguém da vila vai sentir falta. Quase ninguém.' },
  aldeaoPouco: { nome: 'aldeão (um pouco)', fome: 35, essencia: 2, descricao: 'Acorda fraco amanhã.' },
  aldeaoFim: { nome: 'aldeão (até o fim)', fome: 100, essencia: 6, descricao: 'Mata. A vila vai notar, e a culpa fica.' },
} as const;

export type Alimento = keyof typeof ALIMENTOS;

// Poderes comprados no altar do porão com essência
export const PODERES = {
  velocidade: { nome: 'Velocidade', custo: 3, descricao: 'À noite você corre ainda mais rápido.' },
  visaoNoturna: { nome: 'Visão noturna', custo: 3, descricao: 'A noite quase não escurece para você.' },
  hipnose: { nome: 'Hipnose', custo: 5, descricao: 'Quem você morde sem matar não lembra de nada.' },
  nevoa: { nome: 'Névoa', custo: 6, descricao: 'Tecla V, à noite: vira névoa por 1 hora. Ninguém te vê. Dá fome.' },
  morcego: { nome: 'Morcego', custo: 8, descricao: 'Tecla B, à noite e fora de casa: voa para outro lugar. Dá fome.' },
} as const;

export type Poder = keyof typeof PODERES;

// Sinais físicos pela fome (a partir de quanto aparecem)
export const SINAIS = [
  { fome: 50, nome: 'Palidez' },
  { fome: 75, nome: 'Olhos vermelhos' },
  { fome: 90, nome: 'Presas à mostra' },
];

// Viajantes que às vezes acampam na estrada perto do portão da vila, à noite
export const VIAJANTES = ['um mercador de tecidos', 'um peregrino', 'um caixeiro-viajante', 'uma vendedora de ervas'];
export const ACAMPAMENTO_DO_VIAJANTE = { coluna: 118, linha: 78 };
export const VIAJANTE_CHEGA = 20;
export const VIAJANTE_PARTE = 4;

// Onde os cervos aparecem à noite
export const AREA_DOS_CERVOS = { coluna: 158, linha: 20, colunas: 28, linhas: 12 };
export const QUANTIDADE_DE_CERVOS = 3;
