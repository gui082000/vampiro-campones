import Phaser from 'phaser';
import './style.css';
import { ALTURA, LARGURA } from './config';
import { CenaPrincipal } from './cenas/CenaPrincipal';

const jogo = new Phaser.Game({
  type: Phaser.AUTO,
  width: LARGURA,
  height: ALTURA,
  parent: 'app',
  backgroundColor: '#1a3a17',
  pixelArt: true,
  physics: { default: 'arcade' },
  scene: CenaPrincipal,
});

// Só no modo de desenvolvimento (npm run dev): deixa o jogo acessível pelo console do
// navegador e pelos testes automáticos, ex.: jogo.scene.getScene('CenaPrincipal')
if (import.meta.env.DEV) Object.assign(window, { jogo });
