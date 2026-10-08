import Phaser from 'phaser';
import { criarEstrutura } from './Estrutura';
import { FRAME, TILE } from './Tileset';

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

// Portão de entrada e poço da cidade vizinha. O resto do cenário (árvores, paredes,
// caminhos) vem do mapa. Tudo puramente visual por enquanto (sem colisão).
export function criarDecoracoes(scene: Phaser.Scene, centroVilaX: number, centroVilaY: number) {
  criarPortao(scene, centroVilaX - 60, centroVilaY);
  criarPoco(scene, centroVilaX + 180, centroVilaY + 40);
}
