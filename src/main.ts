import Phaser from 'phaser';
import './style.css';
import { ALTURA, LARGURA } from './game/config';
import { CenaPrincipal } from './game/CenaPrincipal';

new Phaser.Game({
  type: Phaser.AUTO,
  width: LARGURA,
  height: ALTURA,
  parent: 'app',
  backgroundColor: '#1a3a17',
  pixelArt: true,
  physics: { default: 'arcade' },
  scene: CenaPrincipal,
});
