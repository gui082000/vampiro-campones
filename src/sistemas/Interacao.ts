import Phaser from 'phaser';
import { CAMADA } from '../arte/Camadas';
import type { Controle } from '../util/Controle';
import { TAMANHO_CELULA } from './Mapa';
import { tocarSom } from '../util/Som';

const COR_DESTAQUE = 0xffee55;
const MARGEM = 4; // pixels de folga em volta de cada coisa

// Qualquer coisa com a qual o Tomás interage apertando E (canteiro, barraca, árvore,
// animal...). x,y é o centro e largura/altura o tamanho da área, em pixels; para coisas
// que andam, x e y podem ser getters.
export interface Interagivel {
  x: number;
  y: number;
  largura: number;
  altura: number;
  dica: () => string;
  acao: () => void;
  ativo?: () => boolean; // falso: some (ex.: árvore cortada)
}

// Para coisas que existem por célula (terra de plantar, água): devolve o que há na
// célula, ou null
export type Provedor = (coluna: number, linha: number) => Interagivel | null;

// Descobre o que está na célula à frente do Tomás, contorna em amarelo e dispara a ação
// quando a tecla E é apertada. A dica fica em `dica`, para o HUD mostrar.
export class Interacao {
  dica = '';

  private itens: Interagivel[] = [];
  private provedores: Provedor[] = [];
  private cursor: Phaser.GameObjects.Rectangle;
  private teclaE: Phaser.Input.Keyboard.Key;
  private controle: Controle;

  constructor(scene: Phaser.Scene, controle: Controle) {
    this.controle = controle;
    this.teclaE = scene.input.keyboard!.addKey('E');
    this.cursor = scene.add
      .rectangle(0, 0, TAMANHO_CELULA, TAMANHO_CELULA)
      .setStrokeStyle(2, COR_DESTAQUE)
      .setDepth(CAMADA.cursor)
      .setVisible(false);
  }

  registrar(...novos: Interagivel[]) {
    this.itens.push(...novos);
  }

  registrarProvedor(provedor: Provedor) {
    this.provedores.push(provedor);
  }

  atualizar(frente: { coluna: number; linha: number }) {
    // Lê a tecla todo quadro, para um E apertado longe de tudo não "sobrar" para depois
    const apertouE = Phaser.Input.Keyboard.JustDown(this.teclaE);

    const alvo = this.controle.livre ? this.alvoEm(frente.coluna, frente.linha) : null;
    if (!alvo) {
      this.cursor.setVisible(false);
      this.dica = '';
      return;
    }
    this.cursor.setVisible(true).setPosition(alvo.x, alvo.y).setSize(alvo.largura, alvo.altura);
    if (apertouE) {
      tocarSom('usar');
      alvo.acao();
    }
    this.dica = this.controle.livre ? alvo.dica() : '';
  }

  private alvoEm(coluna: number, linha: number): Interagivel | null {
    const px = coluna * TAMANHO_CELULA + TAMANHO_CELULA / 2;
    const py = linha * TAMANHO_CELULA + TAMANHO_CELULA / 2;

    let melhor: Interagivel | null = null;
    let menorDistancia = Infinity;
    for (const item of this.itens) {
      if (item.ativo && !item.ativo()) continue;
      const dx = Math.abs(px - item.x);
      const dy = Math.abs(py - item.y);
      if (dx > item.largura / 2 + MARGEM || dy > item.altura / 2 + MARGEM) continue;
      if (dx + dy < menorDistancia) {
        menorDistancia = dx + dy;
        melhor = item;
      }
    }
    if (melhor) return melhor;

    for (const provedor of this.provedores) {
      const alvo = provedor(coluna, linha);
      if (alvo) return alvo;
    }
    return null;
  }
}
