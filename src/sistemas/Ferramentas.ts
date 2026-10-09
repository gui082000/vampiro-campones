import Phaser from 'phaser';
import { FERRAMENTAS } from '../dados/ferramentas';
import type { Inventario } from '../estado/Inventario';

const TECLAS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];

// Lê as teclas 1, 2, 3... e troca a ferramenta na mão (a ordem vem de dados/ferramentas).
export class Ferramentas {
  private teclas: Phaser.Input.Keyboard.Key[];
  private inventario: Inventario;

  constructor(scene: Phaser.Scene, inventario: Inventario) {
    this.inventario = inventario;
    this.teclas = FERRAMENTAS.map((_, i) => scene.input.keyboard!.addKey(TECLAS[i]));
  }

  atualizar() {
    this.teclas.forEach((tecla, i) => {
      if (Phaser.Input.Keyboard.JustDown(tecla)) this.inventario.ferramenta = FERRAMENTAS[i];
    });
  }
}
