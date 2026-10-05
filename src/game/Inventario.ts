import Phaser from 'phaser';
import { SEMENTES_INICIAIS } from './config';
import type { Ferramenta } from './Ferramenta';
import { FERRAMENTAS, NOME_FERRAMENTA } from './Ferramenta';

// Guarda o estado do jogador (recursos e ferramenta selecionada) e desenha o HUD correspondente.
export class Inventario {
  ferramenta: Ferramenta = 'enxada';
  sementes = SEMENTES_INICIAIS;
  trigo = 0;
  moedas = 0;

  private textoInventario: Phaser.GameObjects.Text;
  private textoFerramentas: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, estiloTexto: Phaser.Types.GameObjects.Text.TextStyle) {
    this.textoInventario = scene.add.text(12, 50, '', estiloTexto).setScrollFactor(0).setDepth(11);
    this.textoFerramentas = scene.add
      .text(12, 88, '', estiloTexto)
      .setScrollFactor(0)
      .setDepth(11);

    this.atualizarHud();
  }

  selecionarFerramenta(ferramenta: Ferramenta) {
    this.ferramenta = ferramenta;
    this.atualizarHud();
  }

  atualizarHud() {
    this.textoInventario.setText(
      `Sementes: ${this.sementes}  Trigo: ${this.trigo}  Moedas: ${this.moedas}`,
    );

    const barra = FERRAMENTAS.map((f, i) => {
      const nome = `${i + 1}:${NOME_FERRAMENTA[f]}`;
      return f === this.ferramenta ? `[${nome}]` : ` ${nome} `;
    }).join(' ');
    this.textoFerramentas.setText(barra);
  }
}
