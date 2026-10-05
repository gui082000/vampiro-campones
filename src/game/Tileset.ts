// Mapeamento do tileset (src/assets/tileset.png): 32x32 por tile, 20 colunas.
// As coordenadas (linha, coluna) foram lidas direto na imagem.

export const TILE = 32;
const COLUNAS = 20;

function indice(linha: number, coluna: number): number {
  return linha * COLUNAS + coluna;
}

// Devolve uma grade de índices de frame para uma estrutura que ocupa várias células
function bloco(linhaInicial: number, colunaInicial: number, linhas: number, colunas: number): number[][] {
  const grade: number[][] = [];
  for (let l = 0; l < linhas; l++) {
    const linha: number[] = [];
    for (let c = 0; c < colunas; c++) linha.push(indice(linhaInicial + l, colunaInicial + c));
    grade.push(linha);
  }
  return grade;
}

export const FRAME = {
  arvore: indice(3, 0),
  cercaSegmento: indice(8, 1),
  casaGrande: bloco(0, 3, 3, 3),
  barraca: bloco(11, 10, 3, 2),
  poco: bloco(11, 0, 3, 1),
  portao: bloco(12, 12, 3, 3),
  trilha: indice(15, 0),
};
