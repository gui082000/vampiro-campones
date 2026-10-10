import type Phaser from 'phaser';
import { CAMADA } from '../arte/Camadas';
import { LARGURA } from '../config';

const DURACAO = 4000; // ms na tela
const SUMINDO = 500; // ms finais em que o texto vai apagando
const MAXIMO = 5;

// Mensagens curtas no canto de cima à direita ("+3 Madeira", "Inventário cheio"...),
// que somem sozinhas.
export class Avisos {
  private scene: Phaser.Scene;
  private linhas: { texto: Phaser.GameObjects.Text; vida: number }[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  mostrar(mensagem?: string) {
    if (!mensagem) return;
    const texto = this.scene.add
      .text(LARGURA - 12, 0, mensagem, {
        fontFamily: 'monospace',
        fontSize: '15px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 6, y: 3 },
        wordWrap: { width: 430 },
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(CAMADA.hud);
    this.linhas.push({ texto, vida: DURACAO });
    while (this.linhas.length > MAXIMO) this.linhas.shift()!.texto.destroy();
    this.posicionar();
  }

  atualizar(deltaMs: number) {
    for (const linha of this.linhas) {
      linha.vida -= deltaMs;
      linha.texto.setAlpha(Math.min(1, Math.max(0, linha.vida / SUMINDO)));
    }
    const vivas = this.linhas.filter((l) => l.vida > 0);
    if (vivas.length === this.linhas.length) return;
    for (const l of this.linhas) if (l.vida <= 0) l.texto.destroy();
    this.linhas = vivas;
    this.posicionar();
  }

  private posicionar() {
    let y = 12;
    for (const l of this.linhas) {
      l.texto.setY(y);
      y += l.texto.height + 4;
    }
  }
}
