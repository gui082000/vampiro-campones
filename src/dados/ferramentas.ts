// Ferramentas do camponês, na ordem das teclas (1, 2, 3...).
export type Ferramenta = 'enxada' | 'regador' | 'sementes';

export const FERRAMENTAS: Ferramenta[] = ['enxada', 'regador', 'sementes'];

export const NOME_FERRAMENTA: Record<Ferramenta, string> = {
  enxada: 'Enxada',
  regador: 'Regador',
  sementes: 'Sementes',
};

// Número da tecla que seleciona a ferramenta (para textos de ajuda)
export function teclaDaFerramenta(ferramenta: Ferramenta): number {
  return FERRAMENTAS.indexOf(ferramenta) + 1;
}
