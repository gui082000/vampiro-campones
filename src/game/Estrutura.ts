import Phaser from 'phaser';
import { TILE } from './Tileset';

// Desenha uma estrutura multi-tile (casa, barraca, poço...) a partir de uma grade de
// frames do tileset. x,y é o canto superior-esquerdo da estrutura.
export function criarEstrutura(
  scene: Phaser.Scene,
  frames: number[][],
  x: number,
  y: number,
  profundidade = 1,
): Phaser.GameObjects.Image[] {
  const imagens: Phaser.GameObjects.Image[] = [];

  frames.forEach((linha, l) => {
    linha.forEach((frame, c) => {
      const img = scene.add
        .image(x + c * TILE + TILE / 2, y + l * TILE + TILE / 2, 'tiles', frame)
        .setDepth(profundidade);
      imagens.push(img);
    });
  });

  return imagens;
}

export function criarTile(
  scene: Phaser.Scene,
  frame: number,
  x: number,
  y: number,
  profundidade = 1,
): Phaser.GameObjects.Image {
  return scene.add.image(x, y, 'tiles', frame).setDepth(profundidade);
}
