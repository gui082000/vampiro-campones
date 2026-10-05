export type Ferramenta = 'enxada' | 'regador' | 'sementes';

export const FERRAMENTAS: Ferramenta[] = ['enxada', 'regador', 'sementes'];

export const NOME_FERRAMENTA: Record<Ferramenta, string> = {
  enxada: 'Enxada',
  regador: 'Regador',
  sementes: 'Sementes',
};
