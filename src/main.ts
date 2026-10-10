import Phaser from 'phaser';
import './style.css';
import { ALTURA, LARGURA } from './config';
import { CenaInicio } from './cenas/CenaInicio';
import { CenaPrincipal } from './cenas/CenaPrincipal';

const jogo = new Phaser.Game({
  type: Phaser.AUTO,
  width: LARGURA,
  height: ALTURA,
  parent: 'app',
  backgroundColor: '#1a3a17',
  pixelArt: true,
  physics: { default: 'arcade' },
  // ?direto (só no desenvolvimento) pula a tela inicial, para os testes automáticos
  scene: import.meta.env.DEV && location.search.includes('direto') ? [CenaPrincipal, CenaInicio] : [CenaInicio, CenaPrincipal],
});

// Só no modo de desenvolvimento (npm run dev): deixa o jogo acessível pelo console do
// navegador e pelos testes automáticos, ex.: jogo.scene.getScene('CenaPrincipal')
if (import.meta.env.DEV) Object.assign(window, { jogo });
