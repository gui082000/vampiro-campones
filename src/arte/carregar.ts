import type Phaser from 'phaser';
import tilesetUrl from '../assets/tileset.png';
import mapaImagemUrl from '../assets/Mapaprincipal.png';
import mapaDadosUrl from '../assets/MapaGame2d.json?url';
import { carregarPersonagem } from './Personagem';
import { CHAVE_TILESET, TILE } from './Tileset';

export const CHAVE_MAPA_IMAGEM = 'mapa-imagem';
export const CHAVE_MAPA_DADOS = 'mapa-dados';

// Único lugar que carrega arquivos de arte. Para trocar a arte provisória por sprites
// de verdade, é nesta pasta que se mexe. O JSON do mapa vem junto da imagem porque
// os dois são exportados juntos do RPG Map 2.
export function carregarArte(scene: Phaser.Scene) {
  scene.load.spritesheet(CHAVE_TILESET, tilesetUrl, { frameWidth: TILE, frameHeight: TILE });
  scene.load.image(CHAVE_MAPA_IMAGEM, mapaImagemUrl);
  scene.load.json(CHAVE_MAPA_DADOS, mapaDadosUrl);
  carregarPersonagem(scene);
}
