import Phaser from 'phaser';
import { criarEstrutura } from './Estrutura';
import { FRAME, TILE } from './Tileset';

// Casa feita a partir do tileset (3x3 tiles = 96x96). x,y é o centro da casa.
export function criarCasa(scene: Phaser.Scene, x: number, y: number) {
  const largura = FRAME.casaGrande[0].length * TILE;
  const altura = FRAME.casaGrande.length * TILE;

  return criarEstrutura(scene, FRAME.casaGrande, x - largura / 2, y - altura / 2, 2);
}
