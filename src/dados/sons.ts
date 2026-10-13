// Sons provisórios, feitos por código (sem arquivos): cada som é uma lista de notas
// tocadas em sequência. Para trocar por um som de verdade, só este arquivo e
// util/Som.ts mudam; o jogo continua chamando tocarSom('nome').
export interface Nota {
  freq: number; // Hz (0 = ruído)
  dur: number; // segundos
  onda?: OscillatorType;
  vol?: number; // 0 a 1
  ate?: number; // desliza a frequência até este valor
}

export const SONS = {
  usar: [{ freq: 520, dur: 0.05, onda: 'square', vol: 0.12 }],
  menuMover: [{ freq: 700, dur: 0.03, onda: 'square', vol: 0.08 }],
  menuEscolher: [{ freq: 660, dur: 0.05, onda: 'square', vol: 0.1 }, { freq: 880, dur: 0.06, onda: 'square', vol: 0.1 }],
  texto: [{ freq: 440, dur: 0.03, onda: 'triangle', vol: 0.1 }],
  mordida: [{ freq: 220, dur: 0.18, onda: 'sawtooth', vol: 0.2, ate: 90 }, { freq: 0, dur: 0.12, vol: 0.12 }],
  sino: [{ freq: 392, dur: 0.9, onda: 'sine', vol: 0.25 }, { freq: 311, dur: 1.2, onda: 'sine', vol: 0.2 }],
  amanhecer: [{ freq: 523, dur: 0.12, onda: 'triangle', vol: 0.15 }, { freq: 659, dur: 0.12, onda: 'triangle', vol: 0.15 }, { freq: 784, dur: 0.25, onda: 'triangle', vol: 0.15 }],
  pista: [{ freq: 784, dur: 0.08, onda: 'sine', vol: 0.15 }, { freq: 1046, dur: 0.15, onda: 'sine', vol: 0.15 }],
  perigo: [{ freq: 150, dur: 0.25, onda: 'sawtooth', vol: 0.18 }, { freq: 140, dur: 0.35, onda: 'sawtooth', vol: 0.18 }],
  poder: [{ freq: 300, dur: 0.4, onda: 'sine', vol: 0.18, ate: 900 }],
  festa: [{ freq: 523, dur: 0.1, onda: 'square', vol: 0.1 }, { freq: 659, dur: 0.1, onda: 'square', vol: 0.1 }, { freq: 784, dur: 0.1, onda: 'square', vol: 0.1 }, { freq: 1046, dur: 0.2, onda: 'square', vol: 0.1 }],
  trovao: [{ freq: 0, dur: 0.8, vol: 0.3 }],
  fim: [{ freq: 196, dur: 0.6, onda: 'sine', vol: 0.25 }, { freq: 165, dur: 0.6, onda: 'sine', vol: 0.25 }, { freq: 131, dur: 1.4, onda: 'sine', vol: 0.25 }],
} satisfies Record<string, Nota[]>;

export type NomeDoSom = keyof typeof SONS;
