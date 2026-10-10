import type Phaser from 'phaser';
import { CAMADA } from '../arte/Camadas';
import { ALTURA, LARGURA } from '../config';
import type { Controle } from '../util/Controle';

// Escurece a tela, faz algo no meio (ex.: pular a noite dormindo) e clareia de novo.
export class Transicao {
  private scene: Phaser.Scene;
  private controle: Controle;
  private tela: Phaser.GameObjects.Rectangle;
  private ativa = false;

  constructor(scene: Phaser.Scene, controle: Controle) {
    this.scene = scene;
    this.controle = controle;
    this.tela = scene.add
      .rectangle(0, 0, LARGURA, ALTURA, 0x000000)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(CAMADA.transicao)
      .setAlpha(0)
      .setVisible(false);
  }

  get emAndamento(): boolean {
    return this.ativa;
  }

  escurecerE(noMeio: () => void) {
    if (this.ativa) return;
    this.ativa = true;
    this.controle.ocupar('transicao');
    this.tela.setVisible(true).setAlpha(0);
    this.scene.tweens.add({
      targets: this.tela,
      alpha: 1,
      duration: 450,
      onComplete: () => {
        noMeio();
        this.scene.tweens.add({
          targets: this.tela,
          alpha: 0,
          delay: 300,
          duration: 450,
          onComplete: () => {
            this.tela.setVisible(false);
            this.ativa = false;
            this.controle.liberar('transicao');
          },
        });
      },
    });
  }
}
