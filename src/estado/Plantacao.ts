import { COLHEITA_POR_PLANTA, HORAS_PARA_CRESCER } from '../config';
import { teclaDaFerramenta } from '../dados/ferramentas';
import type { Inventario } from './Inventario';

export type Solo = 'nao-arado' | 'arado' | 'plantado';

// Um canteiro da fazenda. Só dados simples (o desenho fica em arte/Objetos),
// para poder salvar e testar.
export interface Canteiro {
  coluna: number;
  linha: number;
  solo: Solo;
  regado: boolean; // a rega vale até a colheita: não seca com a passagem dos dias
  horasCrescendo: number;
}

export function novoCanteiro(coluna: number, linha: number): Canteiro {
  return { coluna, linha, solo: 'nao-arado', regado: false, horasCrescendo: 0 };
}

export function estaPronto(c: Canteiro): boolean {
  return c.solo === 'plantado' && c.horasCrescendo >= HORAS_PARA_CRESCER;
}

// De 0 (acabou de plantar) a 1 (pronto para colher)
export function progresso(c: Canteiro): number {
  return c.solo === 'plantado' ? c.horasCrescendo / HORAS_PARA_CRESCER : 0;
}

// Faz a planta crescer, se estiver regada. Devolve true se algo mudou.
export function crescer(c: Canteiro, horas: number): boolean {
  if (c.solo !== 'plantado' || !c.regado || estaPronto(c)) return false;
  c.horasCrescendo = Math.min(c.horasCrescendo + horas, HORAS_PARA_CRESCER);
  return true;
}

// Usa a ferramenta na mão no canteiro (tecla E). Colher não precisa de ferramenta.
// Devolve true se algo mudou.
export function usarNoCanteiro(c: Canteiro, inventario: Inventario): boolean {
  const ferramenta = inventario.ferramenta;

  if (estaPronto(c)) {
    inventario.trigo += COLHEITA_POR_PLANTA;
    c.solo = 'arado';
    c.regado = false;
    c.horasCrescendo = 0;
    return true;
  }

  if (ferramenta === 'regador' && c.solo !== 'nao-arado' && !c.regado) {
    c.regado = true;
    return true;
  }

  if (ferramenta === 'sementes' && c.solo === 'arado' && inventario.sementes > 0) {
    inventario.sementes -= 1;
    c.solo = 'plantado';
    c.horasCrescendo = 0;
    return true;
  }

  if (ferramenta === 'enxada' && c.solo === 'nao-arado') {
    c.solo = 'arado';
    return true;
  }

  return false;
}

// Texto de ajuda mostrado quando o jogador está perto do canteiro
export function dicaDoCanteiro(c: Canteiro, inventario: Inventario): string {
  const ferramenta = inventario.ferramenta;

  if (c.solo === 'plantado') {
    if (estaPronto(c)) return 'E: colher';
    if (ferramenta === 'regador') return c.regado ? 'Já está regado' : 'E: regar';
    const pct = Math.floor(progresso(c) * 100);
    const falta = c.regado ? '' : ` · precisa de água (${teclaDaFerramenta('regador')}: regador)`;
    return `Crescendo... ${pct}%${falta}`;
  }

  if (c.solo === 'arado') {
    if (ferramenta === 'sementes') {
      return inventario.sementes > 0 ? 'E: plantar semente' : 'Sem sementes (compre na barraca)';
    }
    if (ferramenta === 'regador') return c.regado ? 'Já está regado' : 'E: regar';
    return `Terra pronta (${teclaDaFerramenta('sementes')}: sementes)`;
  }

  return ferramenta === 'enxada'
    ? 'E: arar a terra'
    : `Pegue a enxada (${teclaDaFerramenta('enxada')}) para arar`;
}
