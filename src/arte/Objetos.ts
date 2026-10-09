import type Phaser from 'phaser';
import { type Canteiro, estaPronto, progresso } from '../estado/Plantacao';
import { CAMADA } from './Camadas';
import { FRAME, TILE, criarEstrutura } from './Tileset';

// Desenho dos objetos do mundo. Quase tudo é provisório, feito com formas e cores.
// Para trocar por sprites, mude estas funções e mantenha o que elas devolvem: o
// retângulo de "destaque" é o que ganha o contorno amarelo quando o jogador chega perto.

const COR = {
  terraNaoArada: 0x8a6a3a,
  terraArada: 0x6b4a2a,
  terraMolhada: 0x3a2410, // terra molhada fica mais escura
  broto: 0x6abe30,
  maduro: 0xf2c230,
  caixa: 0x8b5a2b,
  tampaCaixa: 0x6b4423,
};

const TAMANHO_CANTEIRO = 30; // um pouco menor que a célula (32), para os canteiros não grudarem

export interface VisualCanteiro {
  solo: Phaser.GameObjects.Rectangle;
  planta: Phaser.GameObjects.Rectangle;
}

// x,y é o centro do canteiro
export function criarCanteiro(scene: Phaser.Scene, x: number, y: number): VisualCanteiro {
  const solo = scene.add.rectangle(x, y, TAMANHO_CANTEIRO, TAMANHO_CANTEIRO).setDepth(CAMADA.chao);
  const planta = scene.add.rectangle(x, y, 4, 4).setDepth(CAMADA.chao).setVisible(false);
  return { solo, planta };
}

export function desenharCanteiro(visual: VisualCanteiro, c: Canteiro) {
  if (c.solo === 'nao-arado') visual.solo.setFillStyle(COR.terraNaoArada, 0.35);
  else visual.solo.setFillStyle(c.regado ? COR.terraMolhada : COR.terraArada, 1);

  if (c.solo !== 'plantado') {
    visual.planta.setVisible(false);
    return;
  }

  const tamanho = 6 + progresso(c) * 20;
  visual.planta.setVisible(true);
  visual.planta.setSize(tamanho, tamanho);
  visual.planta.setFillStyle(estaPronto(c) ? COR.maduro : COR.broto);
}

// Barraca de sementes, com a arte do tileset. x,y é o centro. Devolve o destaque.
export function desenharBarraca(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Rectangle {
  const largura = FRAME.barraca[0].length * TILE;
  const altura = FRAME.barraca.length * TILE;

  criarEstrutura(scene, FRAME.barraca, x - largura / 2, y - altura / 2, CAMADA.objetos);
  criarRotulo(scene, x, y - altura / 2 - 14, 'Barraca de sementes');
  return scene.add.rectangle(x, y, largura, altura).setDepth(CAMADA.objetos);
}

// Caixa de venda, feita com formas. x,y é o centro. Devolve o destaque.
export function desenharCaixaDeVenda(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Rectangle {
  const largura = 56;
  const altura = 44;

  const caixa = scene.add.rectangle(x, y, largura, altura, COR.caixa).setDepth(CAMADA.objetos);
  scene.add.rectangle(x, y - altura / 2 + 6, largura - 10, 4, COR.tampaCaixa).setDepth(CAMADA.objetos);
  criarRotulo(scene, x, y - altura / 2 - 14, 'Caixa de venda');
  return caixa;
}

function criarRotulo(scene: Phaser.Scene, x: number, y: number, texto: string) {
  scene.add
    .text(x, y, texto, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 4, y: 2 },
    })
    .setOrigin(0.5)
    .setDepth(CAMADA.rotulos);
}
