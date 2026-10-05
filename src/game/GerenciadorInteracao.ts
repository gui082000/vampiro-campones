import Phaser from 'phaser';
import type { Interagivel } from './Interagivel';
import { Jogador } from './Jogador';

// Acompanha todos os Interagiveis da cena, destaca o mais próximo do jogador
// e dispara a ação dele quando a tecla E é pressionada.
export class GerenciadorInteracao {
  private itens: Interagivel[] = [];
  private teclaE: Phaser.Input.Keyboard.Key;
  private textoDica: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, estiloTexto: Phaser.Types.GameObjects.Text.TextStyle) {
    this.teclaE = scene.input.keyboard!.addKey('E');
    this.textoDica = scene.add
      .text(400, 570, '', estiloTexto)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(11);
  }

  registrar(...novos: Interagivel[]) {
    this.itens.push(...novos);
  }

  atualizar(jogador: Jogador) {
    let alvo: Interagivel | null = null;
    let menorDistancia = Infinity;

    for (const item of this.itens) {
      const d = Phaser.Math.Distance.Between(jogador.x, jogador.y, item.x, item.y);
      if (d < item.raio && d < menorDistancia) {
        menorDistancia = d;
        alvo = item;
      }
    }

    for (const item of this.itens) {
      if (item === alvo) item.destaque.setStrokeStyle(2, 0xffee55);
      else item.destaque.setStrokeStyle();
    }

    if (!alvo) {
      this.textoDica.setText('');
      return;
    }

    this.textoDica.setText(alvo.dica());

    if (Phaser.Input.Keyboard.JustDown(this.teclaE)) {
      alvo.acao();
      this.textoDica.setText(alvo.dica());
    }
  }
}
