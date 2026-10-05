import Phaser from 'phaser';
import { criarEstrutura, criarTile } from './Estrutura';
import { FRAME, TILE } from './Tileset';

function criarArvore(scene: Phaser.Scene, centroX: number, centroY: number) {
  criarTile(scene, FRAME.arvore, centroX, centroY, 3).setScale(1.7);
}

function criarCercaHorizontal(scene: Phaser.Scene, xInicial: number, y: number, quantidade: number) {
  for (let i = 0; i < quantidade; i++) {
    criarTile(scene, FRAME.cercaSegmento, xInicial + i * TILE, y, 2);
  }
}

function criarPoco(scene: Phaser.Scene, centroX: number, baseY: number) {
  const largura = FRAME.poco[0].length * TILE;
  const altura = FRAME.poco.length * TILE;
  criarEstrutura(scene, FRAME.poco, centroX - largura / 2, baseY - altura, 2);
}

function criarPortao(scene: Phaser.Scene, centroX: number, centroY: number) {
  const largura = FRAME.portao[0].length * TILE;
  const altura = FRAME.portao.length * TILE;
  criarEstrutura(scene, FRAME.portao, centroX - largura / 2, centroY - altura / 2, 2);
}

// Espalha árvores, cercas, o poço da vila e o portão de entrada pelo mapa.
// Tudo puramente visual por enquanto (sem colisão).
export function criarDecoracoes(scene: Phaser.Scene, larguraMundo: number, alturaMundo: number) {
  // Árvores nas bordas de cima e de baixo do mapa inteiro
  for (let x = 80; x < larguraMundo; x += 170) {
    criarArvore(scene, x, 40);
    criarArvore(scene, x, alturaMundo - 10);
  }

  // Cerca ao redor do canteiro da fazenda (6 colunas x 2 linhas, centro em 450,440)
  criarCercaHorizontal(scene, 450 - 3 * TILE, 440 - 2 * TILE, 6);
  criarCercaHorizontal(scene, 450 - 3 * TILE, 440 + 2 * TILE, 6);

  // Portão marcando a entrada da cidade vizinha
  criarPortao(scene, larguraMundo - 560, alturaMundo / 2);

  // Poço no centro da vila
  criarPoco(scene, larguraMundo - 320, alturaMundo / 2 + 40);
}
