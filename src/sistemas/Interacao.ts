import Phaser from 'phaser';

const COR_DESTAQUE = 0xffee55;

// Contrato comum para qualquer coisa com a qual o jogador possa interagir apertando E
// (canteiros, barracas, caixas de venda, portas, etc).
export interface Interagivel {
  x: number;
  y: number;
  raio: number;
  destaque: Phaser.GameObjects.Rectangle;
  dica: () => string;
  acao: () => void;
}

// Acompanha todos os Interagiveis da cena, destaca o mais próximo do jogador e
// dispara a ação dele quando a tecla E é pressionada. A dica do alvo fica em `dica`,
// para o HUD mostrar.
export class Interacao {
  dica = '';

  private itens: Interagivel[] = [];
  private alvo: Interagivel | null = null;
  private teclaE: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    this.teclaE = scene.input.keyboard!.addKey('E');
  }

  registrar(...novos: Interagivel[]) {
    this.itens.push(...novos);
  }

  atualizar(jogador: { x: number; y: number }) {
    const alvo = this.maisProximo(jogador.x, jogador.y);

    if (alvo !== this.alvo) {
      this.alvo?.destaque.setStrokeStyle();
      alvo?.destaque.setStrokeStyle(2, COR_DESTAQUE);
      this.alvo = alvo;
    }

    // Lê a tecla todo quadro, para um E apertado longe de tudo não "sobrar" para depois
    const apertouE = Phaser.Input.Keyboard.JustDown(this.teclaE);
    if (alvo && apertouE) alvo.acao();

    this.dica = alvo ? alvo.dica() : '';
  }

  private maisProximo(x: number, y: number): Interagivel | null {
    let alvo: Interagivel | null = null;
    let menorDistancia = Infinity;

    for (const item of this.itens) {
      const d = Phaser.Math.Distance.Between(x, y, item.x, item.y);
      if (d < item.raio && d < menorDistancia) {
        menorDistancia = d;
        alvo = item;
      }
    }
    return alvo;
  }
}
