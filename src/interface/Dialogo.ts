import Phaser from 'phaser';
import { CAMADA } from '../arte/Camadas';
import { ALTURA, LARGURA } from '../config';
import type { Controle } from '../util/Controle';
import { tocarSom } from '../util/Som';

const ALTURA_CAIXA = 120;
const TOPO = ALTURA - 110 - ALTURA_CAIXA;

// Caixa de diálogo com retrato simples (um círculo na cor do personagem) e nome.
// Mostra as falas uma por vez (no máximo 5 por cena); E avança, a última fecha.
export class Dialogo {
  private aberto = false;
  private falas: string[] = [];
  private atual = 0;
  private aoTerminar: (() => void) | null = null;
  private controle: Controle;
  private objetos: Phaser.GameObjects.GameObject[];
  private retrato: Phaser.GameObjects.Arc;
  private nome: Phaser.GameObjects.Text;
  private texto: Phaser.GameObjects.Text;
  private teclas: Phaser.Input.Keyboard.Key[];

  constructor(scene: Phaser.Scene, controle: Controle) {
    this.controle = controle;
    const fixo = <T extends Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth>(o: T) =>
      o.setScrollFactor(0).setDepth(CAMADA.janela);
    const caixa = fixo(
      scene.add.rectangle(LARGURA / 2, TOPO + ALTURA_CAIXA / 2, LARGURA - 40, ALTURA_CAIXA, 0x16121e, 0.95).setStrokeStyle(2, 0x8a7a5a),
    );
    this.retrato = fixo(scene.add.circle(70, TOPO + 50, 30, 0xffffff).setStrokeStyle(3, 0x000000));
    this.nome = fixo(scene.add.text(40, TOPO + 86, '', { fontFamily: 'monospace', fontSize: '13px', color: '#ffe066' }));
    this.texto = fixo(
      scene.add
        .text(120, TOPO + 16, '', { fontFamily: 'monospace', fontSize: '15px', color: '#ffffff', lineSpacing: 4 })
        .setWordWrapWidth(LARGURA - 180),
    );
    const dica = fixo(
      scene.add.text(LARGURA - 40, TOPO + ALTURA_CAIXA - 8, 'E ▸', { fontFamily: 'monospace', fontSize: '12px', color: '#8a8a8a' }).setOrigin(1, 1),
    );
    this.objetos = [caixa, this.retrato, this.nome, this.texto, dica];
    this.mostrar(false);
    const teclado = scene.input.keyboard!;
    this.teclas = ['E', 'ENTER', 'SPACE', 'ESC'].map((t) => teclado.addKey(t));
  }

  get estaAberto(): boolean {
    return this.aberto;
  }

  falar(nome: string, cor: number, falas: string[], aoTerminar?: () => void) {
    this.falas = falas.slice(0, 5);
    this.atual = 0;
    this.aoTerminar = aoTerminar ?? null;
    this.nome.setText(nome);
    this.retrato.setFillStyle(cor);
    this.texto.setText(this.falas[0] ?? '');
    if (!this.aberto) {
      this.aberto = true;
      this.controle.ocupar('dialogo');
      this.mostrar(true);
    }
  }

  atualizar() {
    if (!this.aberto) return;
    const apertou = this.teclas.map((t) => Phaser.Input.Keyboard.JustDown(t)).some(Boolean);
    if (!apertou) return;
    tocarSom('texto');
    this.atual++;
    if (this.atual < this.falas.length) {
      this.texto.setText(this.falas[this.atual]);
      return;
    }
    this.aberto = false;
    this.controle.liberar('dialogo');
    this.mostrar(false);
    const depois = this.aoTerminar;
    this.aoTerminar = null;
    depois?.();
  }

  private mostrar(visivel: boolean) {
    for (const o of this.objetos) (o as Phaser.GameObjects.Text).setVisible(visivel);
  }
}
