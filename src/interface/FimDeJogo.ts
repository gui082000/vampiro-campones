import Phaser from 'phaser';
import { CAMADA } from '../arte/Camadas';
import { ALTURA, LARGURA } from '../config';
import type { Controle } from '../util/Controle';

// Tela de fim de jogo (por enquanto só o fim pela fome; os 5 finais chegam na Fase 7).
// E recomeça do zero (carregar o último save chega na Fase 6).
export class FimDeJogo {
  private aberta = false;
  private scene: Phaser.Scene;
  private controle: Controle;
  private teclaE: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, controle: Controle) {
    this.scene = scene;
    this.controle = controle;
    this.teclaE = scene.input.keyboard!.addKey('E');
  }

  get estaAberta(): boolean {
    return this.aberta;
  }

  mostrar(titulo: string, texto: string) {
    if (this.aberta) return;
    this.aberta = true;
    this.controle.ocupar('fim');
    const fixo = <T extends Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth>(o: T) =>
      o.setScrollFactor(0).setDepth(CAMADA.transicao + 1);
    fixo(this.scene.add.rectangle(0, 0, LARGURA, ALTURA, 0x050000, 0.94).setOrigin(0));
    fixo(this.scene.add.text(LARGURA / 2, 200, titulo, { fontFamily: 'monospace', fontSize: '30px', color: '#c03030' }).setOrigin(0.5));
    fixo(
      this.scene.add
        .text(LARGURA / 2, 280, texto, { fontFamily: 'monospace', fontSize: '15px', color: '#e8dcc0', align: 'center' })
        .setOrigin(0.5, 0)
        .setWordWrapWidth(560),
    );
    fixo(this.scene.add.text(LARGURA / 2, 470, 'E: recomeçar', { fontFamily: 'monospace', fontSize: '14px', color: '#8a8a8a' }).setOrigin(0.5));
  }

  atualizar() {
    if (this.aberta && Phaser.Input.Keyboard.JustDown(this.teclaE)) this.scene.scene.restart();
  }
}
