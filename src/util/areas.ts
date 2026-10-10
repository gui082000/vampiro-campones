// Um retângulo em pixels: o centro (x, y) e o tamanho
export interface Retangulo {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

// Um retângulo de células do mapa: a célula do canto superior esquerdo e o tamanho.
export interface AreaDeCelulas {
  coluna: number;
  linha: number;
  colunas: number;
  linhas: number;
}

export function contem(area: AreaDeCelulas, coluna: number, linha: number): boolean {
  return (
    coluna >= area.coluna &&
    coluna < area.coluna + area.colunas &&
    linha >= area.linha &&
    linha < area.linha + area.linhas
  );
}

export function dentroDeAlguma(areas: AreaDeCelulas[], coluna: number, linha: number): boolean {
  return areas.some((a) => contem(a, coluna, linha));
}

// A mesma área com uma margem de células em volta
export function comMargem(area: AreaDeCelulas, margem: number): AreaDeCelulas {
  return {
    coluna: area.coluna - margem,
    linha: area.linha - margem,
    colunas: area.colunas + margem * 2,
    linhas: area.linhas + margem * 2,
  };
}
