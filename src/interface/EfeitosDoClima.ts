import type Phaser from 'phaser';
import { CAMADA } from '../arte/Camadas';
import { ALTURA, LARGURA } from '../config';
import type { Tempo } from '../dados/clima';
import { tocarSom } from '../util/Som';

const GOTAS = 90;
const COR_CHUVA = 0xa0b8d8;
const COR_NEBLINA = 0xc8ccd4;

// Chuva, neblina e relâmpagos por cima do mundo (só ao ar livre). Só desenha.
export class EfeitosDoClima {
  private chuva: Phaser.GameObjects.Graphics;
  private neblina: Phaser.GameObjects.Rectangle;
  private clarao: Phaser.GameObjects.Rectangle;
  private gotas = Array.from({ length: GOTAS }, () => ({ x: Math.random() * LARGURA, y: Math.random() * ALTURA }));
  private proximoRaio = 4000;

  constructor(scene: Phaser.Scene) {
    const fixo = <T extends Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth>(o: T) =>
      o.setScrollFactor(0).setDepth(CAMADA.noite - 0.5);
    this.chuva = fixo(scene.add.graphics());
    this.neblina = fixo(scene.add.rectangle(0, 0, LARGURA, ALTURA, COR_NEBLINA).setOrigin(0).setAlpha(0));
    this.clarao = fixo(scene.add.rectangle(0, 0, LARGURA, ALTURA, 0xffffff).setOrigin(0).setAlpha(0)).setDepth(CAMADA.noite + 0.5);
  }

  atualizar(tempo: Tempo, aoArLivre: boolean, deltaMs: number) {
    const chovendo = aoArLivre && (tempo === 'chuva' || tempo === 'tempestade');
    this.chuva.clear();
    if (chovendo) {
      const forte = tempo === 'tempestade';
      const queda = (forte ? 0.9 : 0.6) * deltaMs;
      this.chuva.lineStyle(1, COR_CHUVA, forte ? 0.7 : 0.5);
      for (const g of this.gotas) {
        g.y += queda;
        g.x -= queda * 0.25;
        if (g.y > ALTURA) {
          g.y -= ALTURA;
          g.x = Math.random() * (LARGURA + 100);
        }
        this.chuva.lineBetween(g.x, g.y, g.x + 3, g.y - 12);
      }
    }

    const alvoNeblina = aoArLivre ? (tempo === 'neblina' ? 0.4 : tempo === 'tempestade' ? 0.15 : 0) : 0;
    this.neblina.setAlpha(this.neblina.alpha + (alvoNeblina - this.neblina.alpha) * Math.min(1, deltaMs / 800));

    // Relâmpago de vez em quando na tempestade
    this.clarao.setAlpha(Math.max(0, this.clarao.alpha - deltaMs / 300));
    if (aoArLivre && tempo === 'tempestade') {
      this.proximoRaio -= deltaMs;
      if (this.proximoRaio <= 0) {
        this.clarao.setAlpha(0.6);
        tocarSom('trovao');
        this.proximoRaio = 5000 + Math.random() * 8000;
      }
    }
  }
}
