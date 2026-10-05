import Phaser from 'phaser';
import { FERRAMENTAS } from './Ferramenta';
import type { Inventario } from './Inventario';

// Lê as teclas 1, 2 e 3 e troca a ferramenta ativa no inventário.
export class SeletorFerramenta {
  private teclas: Phaser.Input.Keyboard.Key[];
  private inventario: Inventario;

  constructor(scene: Phaser.Scene, inventario: Inventario) {
    this.inventario = inventario;
    this.teclas = [
      scene.input.keyboard!.addKey('ONE'),
      scene.input.keyboard!.addKey('TWO'),
      scene.input.keyboard!.addKey('THREE'),
    ];
  }

  atualizar() {
    this.teclas.forEach((tecla, i) => {
      if (Phaser.Input.Keyboard.JustDown(tecla)) {
        this.inventario.selecionarFerramenta(FERRAMENTAS[i]);
      }
    });
  }
}
