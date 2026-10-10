import Phaser from 'phaser';
import { TAMANHO_BARRA } from '../config';
import { comer } from '../estado/Energia';
import type { Mundo } from './Mundo';

const TECLAS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];

// Escolhe o item da mão com as teclas 1 a 8 (ou a rodinha do mouse) e come o item
// da mão com F.
export class BarraDeAtalhos {
  private mundo: Mundo;
  private teclas: Phaser.Input.Keyboard.Key[];
  private teclaComer: Phaser.Input.Keyboard.Key;

  constructor(mundo: Mundo) {
    this.mundo = mundo;
    const teclado = mundo.cena.input.keyboard!;
    this.teclas = TECLAS.slice(0, TAMANHO_BARRA).map((t) => teclado.addKey(t));
    this.teclaComer = teclado.addKey('F');

    mundo.cena.input.on('wheel', (_p: unknown, _o: unknown, _dx: number, dy: number) => {
      if (!mundo.controle.livre || dy === 0) return;
      const inventario = mundo.inventario;
      inventario.selecionar((inventario.selecionado + (dy > 0 ? 1 : -1) + TAMANHO_BARRA) % TAMANHO_BARRA);
    });
  }

  atualizar() {
    // Lê as teclas sempre, para nenhum aperto "sobrar" para depois de fechar um menu
    const apertadas = this.teclas.map((t) => Phaser.Input.Keyboard.JustDown(t));
    const querComer = Phaser.Input.Keyboard.JustDown(this.teclaComer);
    if (!this.mundo.controle.livre) return;

    const indice = apertadas.indexOf(true);
    if (indice >= 0) this.mundo.inventario.selecionar(indice);
    if (querComer) this.mundo.avisos.mostrar(comer(this.mundo.inventario, this.mundo.energia).aviso);
  }
}
