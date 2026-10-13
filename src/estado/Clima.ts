import { CLIMA } from '../config';
import {
  CHANCES_DO_TEMPO,
  EVENTOS_ALEATORIOS,
  FASES_DA_LUA,
  FESTIVAIS,
  LUA_CHEIA,
  TEMPOS,
  type EventoAleatorio,
  type Festival,
  type Tempo,
} from '../dados/clima';
import type { Estacao } from '../dados/estacoes';
import { dataDoDia } from './Calendario';

// O tempo do dia e as festas já feitas. Só dados simples, para poder salvar.
export class Clima {
  tempo: Tempo = 'sol';
  festivaisFeitos: number[] = []; // dias em que o Tomás participou da festa
}

export function sortearTempo(estacao: Estacao, aleatorio: () => number): Tempo {
  let sorte = aleatorio();
  for (const [tempo, chance] of Object.entries(CHANCES_DO_TEMPO[estacao]) as [Tempo, number][]) {
    sorte -= chance;
    if (sorte < 0) return tempo;
  }
  return 'sol';
}

export const nomeDoTempo = (c: Clima) => TEMPOS[c.tempo].nome;
export const chove = (c: Clima) => c.tempo === 'chuva' || c.tempo === 'tempestade';

// Céu fechado: o sol não cansa o vampiro
export const ceuFechado = (c: Clima) => c.tempo !== 'sol';

// Neblina e tempestade: os aldeões enxergam menos
export function raioDeVisao(c: Clima): number {
  return c.tempo === 'neblina' || c.tempo === 'tempestade' ? CLIMA.raioDeVisaoComNeblina : CLIMA.raioDeVisao;
}

// A lua segue um ciclo de 8 dias; o dia 1 é lua crescente
export const faseDaLua = (dia: number) => FASES_DA_LUA[dia % FASES_DA_LUA.length];
export const luaCheia = (dia: number) => dia % FASES_DA_LUA.length === LUA_CHEIA;

// Festival do dia (ou null)
export function festivalDoDia(dia: number): Festival | null {
  const { estacao, diaDaEstacao } = dataDoDia(dia);
  const f = FESTIVAIS[estacao];
  return f.diaDaEstacao === diaDaEstacao ? f : null;
}

// Talvez aconteça algo pequeno nesta manhã
export function sortearEvento(aleatorio: () => number, jaMordeu: boolean): EventoAleatorio | null {
  if (aleatorio() >= CLIMA.chanceDeEvento) return null;
  const possiveis = EVENTOS_ALEATORIOS.filter((e) => !e.soSeJaMordeu || jaMordeu);
  return possiveis[Math.floor(aleatorio() * possiveis.length)] ?? null;
}
