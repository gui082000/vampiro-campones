import type Phaser from 'phaser';
import { ESPECIES, type Especie } from '../dados/animais';
import type { IdConstrucao } from '../dados/construcoes';
import { PLANTAS } from '../dados/plantas';
import type { TipoDeRecurso } from '../dados/recursos';
import { estaPronto, progresso, type Canteiro } from '../estado/Plantacao';
import type { Retangulo } from '../util/areas';
import { CAMADA, profundidadeNoMundo } from './Camadas';
import { FRAME, TILE, criarEstrutura } from './Tileset';

// Desenho dos objetos do mundo. Quase tudo é provisório, feito com formas e cores.
// Para trocar por sprites, mude estas funções mantendo o que elas recebem e devolvem.

const COR = {
  terraArada: 0x6b4a2a,
  terraMolhada: 0x3a2410, // terra molhada fica mais escura
  adubo: 0x2a1a0a,
  broto: 0x7ccf4a,
  folha: 0x3f8f3a,
  caule: 0x4f7a30,
  morta: 0x8a7a5a,
  madeira: 0x8b5a2b,
  madeiraEscura: 0x5e3b1c,
  telhado: 0x9a3a2a,
  telhadoEscuro: 0x6a2418,
  pedra: 0x8a8a96,
};

const TAMANHO_CANTEIRO = 30; // um pouco menor que a célula (32), para os canteiros não grudarem

// ---------- Plantação ----------

export interface VisualCanteiro {
  solo: Phaser.GameObjects.Rectangle;
  planta: Phaser.GameObjects.Graphics;
}

// x,y é o centro da célula
export function criarCanteiro(scene: Phaser.Scene, x: number, y: number): VisualCanteiro {
  const solo = scene.add.rectangle(x, y, TAMANHO_CANTEIRO, TAMANHO_CANTEIRO).setDepth(CAMADA.chao);
  const planta = scene.add.graphics({ x, y }).setDepth(profundidadeNoMundo(y + 8));
  return { solo, planta };
}

// Em que fase o desenho está (para só redesenhar quando muda): 0 a 2 crescendo, 3 pronta
function fase(c: Canteiro): number {
  return estaPronto(c) ? 3 : Math.min(2, Math.floor(progresso(c) * 3));
}

export function aparenciaDoCanteiro(c: Canteiro): string {
  const p = c.plantio;
  return `${c.arado}|${c.regado}|${c.adubado}|${p?.planta}|${p?.morta}|${p ? fase(c) : ''}`;
}

export function desenharCanteiro(visual: VisualCanteiro, c: Canteiro) {
  const { solo, planta: g } = visual;
  solo.setVisible(c.arado);
  solo.setFillStyle(c.regado ? COR.terraMolhada : COR.terraArada, 1);
  if (c.adubado) solo.setStrokeStyle(2, COR.adubo);
  else solo.setStrokeStyle();

  g.clear();
  const p = c.plantio;
  if (!p) return;

  if (p.morta) {
    g.lineStyle(2, COR.morta, 1);
    g.lineBetween(-6, 9, 0, -1);
    g.lineBetween(0, -1, 7, 6);
    g.lineBetween(0, -1, -3, -9);
    return;
  }

  const cor = PLANTAS[p.planta].cor;
  switch (fase(c)) {
    case 0: // brotinho
      g.fillStyle(COR.broto, 1);
      g.fillCircle(-3, 5, 3);
      g.fillCircle(3, 5, 3);
      break;
    case 1:
      g.fillStyle(COR.caule, 1);
      g.fillRect(-1, -4, 2, 12);
      g.fillStyle(COR.broto, 1);
      g.fillCircle(-5, 1, 4);
      g.fillCircle(5, -2, 4);
      break;
    case 2:
      g.fillStyle(COR.folha, 1);
      g.fillCircle(0, -1, 10);
      g.fillStyle(cor, 0.7);
      g.fillCircle(-3, -3, 2);
      g.fillCircle(4, 1, 2);
      break;
    default: // pronta: frutos (ou flores) grandes na cor da planta
      g.fillStyle(COR.folha, 1);
      g.fillCircle(0, 0, 11);
      g.fillStyle(cor, 1);
      g.fillCircle(-4, -4, 5);
      g.fillCircle(5, -3, 5);
      g.fillCircle(0, 5, 5);
  }
}

// ---------- Recursos (árvores, pedras...) ----------

// x,y é o centro da célula
export function criarRecurso(scene: Phaser.Scene, x: number, y: number): Phaser.GameObjects.Graphics {
  return scene.add.graphics({ x, y }).setDepth(profundidadeNoMundo(y + 14));
}

export function desenharRecurso(g: Phaser.GameObjects.Graphics, tipo: TipoDeRecurso, comFrutos: boolean) {
  g.clear();
  switch (tipo) {
    case 'arvore':
      g.fillStyle(0x6b4a2a, 1);
      g.fillRect(-4, -2, 8, 16);
      g.fillStyle(0x2f6b2a, 1);
      g.fillCircle(0, -14, 17);
      g.fillStyle(0x3d8a35, 1);
      g.fillCircle(-6, -18, 9);
      g.fillCircle(7, -11, 8);
      break;
    case 'pedra':
      g.fillStyle(0x6e6e7a, 1);
      g.fillEllipse(0, 5, 28, 20);
      g.fillStyle(COR.pedra, 1);
      g.fillEllipse(-3, 2, 16, 10);
      break;
    case 'mato':
      g.fillStyle(0x86a63e, 1);
      g.fillTriangle(-10, 11, -6, -4, -2, 11);
      g.fillTriangle(-3, 11, 2, -8, 6, 11);
      g.fillTriangle(3, 11, 8, -2, 12, 11);
      break;
    case 'arbusto':
      g.fillStyle(0x356b30, 1);
      g.fillCircle(0, 2, 13);
      g.fillStyle(0x427f3a, 1);
      g.fillCircle(-4, -2, 7);
      if (comFrutos) {
        g.fillStyle(0x5a1a48, 1);
        for (const [fx, fy] of [[-6, 4], [5, -3], [2, 7], [7, 5]]) g.fillCircle(fx, fy, 3);
      }
      break;
    case 'erva':
      g.fillStyle(0x5fb06a, 1);
      g.fillEllipse(-5, 5, 8, 14);
      g.fillEllipse(5, 5, 8, 14);
      g.fillStyle(0x78c886, 1);
      g.fillEllipse(0, 1, 8, 16);
      break;
    case 'cogumelo':
      g.fillStyle(0xe8dcc0, 1);
      g.fillRect(-2, 1, 4, 9);
      g.fillStyle(0x9a5a30, 1);
      g.fillEllipse(0, 1, 18, 10);
      break;
  }
}

// ---------- Construções e estações ----------

export function criarRotulo(scene: Phaser.Scene, x: number, y: number, texto: string): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, texto, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 4, y: 2 },
    })
    .setOrigin(0.5)
    .setDepth(CAMADA.rotulos);
}

export function desenharBarraca(scene: Phaser.Scene, r: Retangulo) {
  const largura = FRAME.barraca[0].length * TILE;
  const altura = FRAME.barraca.length * TILE;
  const imagens = criarEstrutura(scene, FRAME.barraca, r.x - largura / 2, r.y - altura / 2, 0);
  for (const img of imagens) img.setDepth(profundidadeNoMundo(r.y + r.altura / 2));
  criarRotulo(scene, r.x, r.y - r.altura / 2 - 12, 'Barraca de sementes');
}

export function desenharCaixaDeVenda(scene: Phaser.Scene, r: Retangulo) {
  const g = scene.add.graphics({ x: r.x, y: r.y }).setDepth(profundidadeNoMundo(r.y + r.altura / 2));
  g.fillStyle(COR.madeira, 1);
  g.fillRect(-r.largura / 2 + 2, -r.altura / 2 + 2, r.largura - 4, r.altura - 4);
  g.fillStyle(COR.madeiraEscura, 1);
  g.fillRect(-r.largura / 2 + 2, -r.altura / 2 + 2, r.largura - 4, 6);
  g.fillRect(-2, -r.altura / 2 + 2, 4, r.altura - 4);
  criarRotulo(scene, r.x, r.y - r.altura / 2 - 12, 'Caixa de venda');
}

export function desenharBancada(scene: Phaser.Scene, r: Retangulo) {
  const g = scene.add.graphics({ x: r.x, y: r.y }).setDepth(profundidadeNoMundo(r.y + r.altura / 2));
  const meia = r.largura / 2 - 2;
  g.fillStyle(COR.madeiraEscura, 1);
  g.fillRect(-meia, 2, 4, 12);
  g.fillRect(meia - 4, 2, 4, 12);
  g.fillStyle(COR.madeira, 1);
  g.fillRect(-meia, -6, meia * 2, 10);
  g.fillStyle(0x9a9aa8, 1); // serrote e martelo em cima
  g.fillRect(-meia + 6, -10, 14, 4);
  g.fillRect(8, -11, 4, 6);
  criarRotulo(scene, r.x, r.y - r.altura / 2 - 14, 'Bancada');
}

export function desenharPorta(scene: Phaser.Scene, r: Retangulo) {
  const g = scene.add.graphics({ x: r.x, y: r.y }).setDepth(CAMADA.chao);
  g.fillStyle(COR.madeiraEscura, 1);
  g.fillRect(-11, -14, 22, 28);
  g.fillStyle(0xd8b040, 1);
  g.fillCircle(6, 1, 2);
}

// Terreno vazio onde algo pode ser construído. Devolve o que precisa sumir depois.
export function desenharTerreno(scene: Phaser.Scene, r: Retangulo, nome: string): Phaser.GameObjects.GameObject[] {
  const marca = scene.add
    .rectangle(r.x, r.y, r.largura - 4, r.altura - 4, 0xffffff, 0.08)
    .setStrokeStyle(2, 0xffffff, 0.45)
    .setDepth(CAMADA.chao);
  const placa = criarRotulo(scene, r.x, r.y, `Terreno: ${nome}`);
  return [marca, placa];
}

export function desenharConstrucao(scene: Phaser.Scene, id: IdConstrucao, r: Retangulo, nome: string) {
  const g = scene.add.graphics({ x: r.x, y: r.y }).setDepth(profundidadeNoMundo(r.y + r.altura / 2));
  const l = r.largura / 2;
  const a = r.altura / 2;

  if (id === 'pasto') {
    // Só a cerca em volta, com uma porteira no meio do lado de cima
    g.setDepth(CAMADA.chao);
    g.lineStyle(3, COR.madeira, 1);
    g.strokeRect(-l + 2, -a + 2, r.largura - 4, r.altura - 4);
    g.fillStyle(COR.madeiraEscura, 1);
    for (let x = -l + 2; x <= l - 2; x += 32) {
      g.fillRect(x - 2, -a, 4, 8);
      g.fillRect(x - 2, a - 8, 4, 8);
    }
    criarRotulo(scene, r.x, r.y - a + 10, nome);
    return;
  }

  if (id === 'poco') {
    g.fillStyle(0x6e6e7a, 1);
    g.fillCircle(0, 6, 22);
    g.fillStyle(0x1e2a44, 1);
    g.fillCircle(0, 6, 14);
    g.fillStyle(COR.madeiraEscura, 1);
    g.fillRect(-20, -24, 4, 30);
    g.fillRect(16, -24, 4, 30);
    g.fillStyle(COR.telhado, 1);
    g.fillTriangle(-26, -20, 0, -36, 26, -20);
    criarRotulo(scene, r.x, r.y - a - 26, nome);
    return;
  }

  // Galinheiro e celeiro: paredes, telhado e porta
  const corParede = id === 'celeiro' ? 0xa83a2a : 0xb08a5a;
  g.fillStyle(corParede, 1);
  g.fillRect(-l + 2, -a + 10, r.largura - 4, r.altura - 12);
  g.fillStyle(id === 'celeiro' ? 0xf0e8d8 : COR.madeiraEscura, 1);
  g.fillRect(-12, a - 26, 24, 24); // porta
  g.fillStyle(COR.telhadoEscuro, 1);
  g.fillTriangle(-l - 4, -a + 14, 0, -a - 16, l + 4, -a + 14);
  g.fillStyle(COR.telhado, 1);
  g.fillTriangle(-l + 4, -a + 12, 0, -a - 10, l - 4, -a + 12);
  criarRotulo(scene, r.x, r.y - a - 24, nome);
}

// ---------- Animais ----------

export function criarAnimal(scene: Phaser.Scene, especie: Especie, x: number, y: number): Phaser.GameObjects.Graphics {
  const { cor, tamanho } = ESPECIES[especie];
  const g = scene.add.graphics({ x, y });
  if (especie === 'galinha') {
    g.fillStyle(cor, 1);
    g.fillEllipse(0, 0, tamanho + 4, tamanho);
    g.fillCircle(tamanho / 2, -tamanho / 2, tamanho / 3);
    g.fillStyle(0xd02020, 1); // crista
    g.fillCircle(tamanho / 2, -tamanho / 2 - 4, 2.5);
    g.fillStyle(0xe8b020, 1); // bico
    g.fillTriangle(tamanho / 2 + 4, -tamanho / 2, tamanho / 2 + 9, -tamanho / 2 + 1, tamanho / 2 + 4, -tamanho / 2 + 3);
  } else {
    g.fillStyle(cor, 1);
    g.fillEllipse(0, 0, tamanho * 1.6, tamanho);
    g.fillStyle(0x3a3030, 1); // manchas
    g.fillCircle(-6, -2, 5);
    g.fillCircle(7, 3, 4);
    g.fillStyle(cor, 1);
    g.fillEllipse(tamanho * 0.85, -4, 14, 12); // cabeça
    g.fillStyle(0x3a3030, 1);
    g.fillRect(-tamanho * 0.6, tamanho / 2 - 2, 4, 6);
    g.fillRect(tamanho * 0.45, tamanho / 2 - 2, 4, 6);
  }
  return g;
}
