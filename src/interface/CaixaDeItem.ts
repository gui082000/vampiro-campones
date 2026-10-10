import type Phaser from 'phaser';
import { chaveDoIcone } from '../arte/Icones';
import { definicaoDoItem } from '../dados/itens';
import type { Pilha } from '../estado/Recipiente';

export type Destaque = 'normal' | 'selecionado' | 'pego';

const BORDA: Record<Destaque, number> = { normal: 0x5a5060, selecionado: 0xffe066, pego: 0x66ccff };

// Um quadradinho de item na tela (barra de atalhos e inventário): ícone, sigla,
// quantidade e, no regador, a água que resta.
export class CaixaDeItem {
  private fundo: Phaser.GameObjects.Rectangle;
  private icone: Phaser.GameObjects.Image;
  private sigla: Phaser.GameObjects.Text;
  private quantidade: Phaser.GameObjects.Text;
  private agua: Phaser.GameObjects.Rectangle;
  private tamanho: number;

  constructor(scene: Phaser.Scene, x: number, y: number, tamanho: number, profundidade: number) {
    this.tamanho = tamanho;
    const fixo = <T extends Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth>(o: T) =>
      o.setScrollFactor(0).setDepth(profundidade);
    this.fundo = fixo(scene.add.rectangle(x, y, tamanho, tamanho, 0x1e1a24, 0.85).setStrokeStyle(2, BORDA.normal));
    this.icone = fixo(scene.add.image(x, y, '__DEFAULT').setVisible(false));
    this.sigla = fixo(
      scene.add
        .text(x, y, '', { fontFamily: 'monospace', fontSize: '12px', color: '#ffffff' })
        .setOrigin(0.5)
        .setStroke('#000000', 3),
    );
    this.quantidade = fixo(
      scene.add
        .text(x + tamanho / 2 - 3, y + tamanho / 2 - 2, '', { fontFamily: 'monospace', fontSize: '11px', color: '#ffffff' })
        .setOrigin(1, 1)
        .setStroke('#000000', 3),
    );
    this.agua = fixo(scene.add.rectangle(x - tamanho / 2 + 4, y + tamanho / 2 - 5, 0, 3, 0x4aa8ff).setOrigin(0, 0.5));
  }

  // aguaFracao: de 0 a 1, só para o regador
  mostrar(pilha: Pilha | null, aguaFracao?: number) {
    if (!pilha) {
      this.icone.setVisible(false);
      this.sigla.setText('');
      this.quantidade.setText('');
      this.agua.setVisible(false);
      return;
    }
    this.icone.setTexture(chaveDoIcone(pilha.item)).setVisible(true);
    this.sigla.setText(definicaoDoItem(pilha.item).sigla);
    this.quantidade.setText(pilha.qtd > 1 ? String(pilha.qtd) : '');
    const comAgua = aguaFracao !== undefined;
    this.agua.setVisible(comAgua);
    if (comAgua) this.agua.setSize((this.tamanho - 8) * aguaFracao, 3);
  }

  mover(x: number, y: number) {
    const t = this.tamanho;
    this.fundo.setPosition(x, y);
    this.icone.setPosition(x, y);
    this.sigla.setPosition(x, y);
    this.quantidade.setPosition(x + t / 2 - 3, y + t / 2 - 2);
    this.agua.setPosition(x - t / 2 + 4, y + t / 2 - 5);
  }

  destacar(destaque: Destaque) {
    this.fundo.setStrokeStyle(destaque === 'normal' ? 2 : 3, BORDA[destaque]);
  }

  setVisible(visivel: boolean) {
    this.fundo.setVisible(visivel);
    this.sigla.setVisible(visivel);
    this.quantidade.setVisible(visivel);
    if (!visivel) {
      this.icone.setVisible(false);
      this.agua.setVisible(false);
    }
  }
}
