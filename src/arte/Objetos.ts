import type Phaser from 'phaser';
import { ESPECIES, type Especie } from '../dados/animais';
import type { IdConstrucao } from '../dados/construcoes';
import { PLANTAS } from '../dados/plantas';
import type { TipoDeRecurso } from '../dados/recursos';
import type { EstiloDeSala, TipoDeMovel } from '../dados/interiores';
import type { EstiloDePredio } from '../dados/vila';
import { estaPronto, progresso, type Canteiro } from '../estado/Plantacao';
import type { Retangulo } from '../util/areas';
import { CAMADA, profundidadeNoMundo } from './Camadas';

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

// ---------- Vila: prédios, lápides, placas ----------

const ESTILO_DO_PREDIO: Record<EstiloDePredio, { parede: number; telhado: number }> = {
  casa: { parede: 0xb89a6e, telhado: 0x7a3a28 },
  igreja: { parede: 0xc8c4bc, telhado: 0x4a4e5e },
  taverna: { parede: 0x9a6a40, telhado: 0x5e2a1c },
  loja: { parede: 0xc0a070, telhado: 0x2e5a3a },
  solar: { parede: 0x8a8a92, telhado: 0x2e2e3a },
  cabana: { parede: 0x6e4a2a, telhado: 0x3e5a2a },
  ruina: { parede: 0x4a4650, telhado: 0x2a2630 },
  armazem: { parede: 0x8a6a4a, telhado: 0x5a4a3a },
};

// Prédio sobre o bloco do mapa: paredes, telhado, porta e a placa com o nome
export function desenharPredio(scene: Phaser.Scene, r: Retangulo, porta: Retangulo, estilo: EstiloDePredio, nome: string) {
  const { parede, telhado } = ESTILO_DO_PREDIO[estilo];
  const g = scene.add.graphics().setDepth(profundidadeNoMundo(r.y + r.altura / 2));
  const esquerda = r.x - r.largura / 2;
  const topo = r.y - r.altura / 2;
  const alturaTelhado = Math.min(r.altura * 0.45, 96);

  g.fillStyle(parede, 1);
  g.fillRect(esquerda, topo + alturaTelhado * 0.6, r.largura, r.altura - alturaTelhado * 0.6);
  g.fillStyle(telhado, 1);
  g.fillRect(esquerda - 4, topo, r.largura + 8, alturaTelhado);
  g.fillStyle(0x000000, 0.18);
  g.fillRect(esquerda - 4, topo + alturaTelhado - 6, r.largura + 8, 6);
  // janelas
  g.fillStyle(estilo === 'ruina' ? 0x101014 : 0xe8d890, estilo === 'ruina' ? 1 : 0.85);
  for (let x = esquerda + 24; x < esquerda + r.largura - 24; x += 64) {
    if (Math.abs(x + 8 - porta.x) < 40) continue;
    g.fillRect(x, topo + alturaTelhado + 14, 16, 14);
  }
  if (estilo === 'igreja') {
    g.fillStyle(0xd8d4cc, 1);
    g.fillRect(r.x - 3, topo - 30, 6, 30);
    g.fillRect(r.x - 12, topo - 22, 24, 5);
  }
  // porta
  g.fillStyle(estilo === 'ruina' ? 0x3a3a40 : COR.madeiraEscura, 1);
  g.fillRect(porta.x - 12, porta.y - 14, 24, 30);
  if (estilo === 'ruina') {
    g.lineStyle(2, 0x6a6a70, 1);
    for (let x = -9; x <= 9; x += 6) g.lineBetween(porta.x + x, porta.y - 14, porta.x + x, porta.y + 16);
  } else {
    g.fillStyle(0xd8b040, 1);
    g.fillCircle(porta.x + 6, porta.y + 2, 2);
  }
  criarRotulo(scene, r.x, topo + alturaTelhado / 2, nome);
}

// Lápide (x,y = centro da célula)
export function desenharLapide(scene: Phaser.Scene, x: number, y: number) {
  const g = scene.add.graphics({ x, y }).setDepth(profundidadeNoMundo(y + 12));
  g.fillStyle(0x8a8a94, 1);
  g.fillRoundedRect(-8, -12, 16, 22, 6);
  g.fillStyle(0x5a5a64, 1);
  g.fillRect(-1, -7, 2, 9);
  g.fillRect(-4, -4, 8, 2);
  g.fillStyle(0x4a6a3a, 1);
  g.fillRect(-10, 9, 20, 3);
}

export function desenharCercaDoCemiterio(scene: Phaser.Scene, r: Retangulo) {
  const g = scene.add.graphics().setDepth(CAMADA.chao);
  g.lineStyle(2, 0x2a2a30, 1);
  g.strokeRect(r.x - r.largura / 2 + 4, r.y - r.altura / 2 + 4, r.largura - 8, r.altura - 8);
}

export function desenharPlaca(scene: Phaser.Scene, x: number, y: number) {
  const g = scene.add.graphics({ x, y }).setDepth(profundidadeNoMundo(y + 12));
  g.fillStyle(COR.madeiraEscura, 1);
  g.fillRect(-2, -2, 4, 16);
  g.fillStyle(COR.madeira, 1);
  g.fillRect(-12, -12, 24, 12);
}

// ---------- Interiores ----------

const CORES_DA_SALA: Record<EstiloDeSala, { piso: number; parede: number }> = {
  madeira: { piso: 0x8a6440, parede: 0x4a3020 },
  pedra: { piso: 0x7a7880, parede: 0x3a3a44 },
  taverna: { piso: 0x6e4a2e, parede: 0x3a2416 },
};

const COR_DO_MOVEL: Record<TipoDeMovel, number> = {
  cama: 0xa04040,
  mesa: 0x8b5a2b,
  fogao: 0x3a3a3a,
  bau: 0x9a6a2a,
  alcapao: 0x4a3a2a,
  balcaoDaLoja: 0x6b4423,
  balcao: 0x6b4423,
  altar: 0xd8d0c0,
  banco: 0x7a5030,
  estante: 0x5e3b1c,
  lareira: 0x6a5a5a,
  barril: 0x8a5a2a,
};

// Sala inteira (piso e paredes). r = retângulo da sala com as paredes; porta = célula da saída.
export function desenharSala(scene: Phaser.Scene, r: Retangulo, porta: Retangulo, estilo: EstiloDeSala) {
  const { piso, parede } = CORES_DA_SALA[estilo];
  const g = scene.add.graphics().setDepth(CAMADA.chao);
  g.fillStyle(parede, 1);
  g.fillRect(r.x - r.largura / 2, r.y - r.altura / 2, r.largura, r.altura);
  g.fillStyle(piso, 1);
  g.fillRect(r.x - r.largura / 2 + 32, r.y - r.altura / 2 + 32, r.largura - 64, r.altura - 64);
  g.lineStyle(1, 0x000000, 0.15);
  for (let y = r.y - r.altura / 2 + 32; y < r.y + r.altura / 2 - 32; y += 16) {
    g.lineBetween(r.x - r.largura / 2 + 32, y, r.x + r.largura / 2 - 32, y);
  }
  g.fillStyle(0xd8c890, 1); // tapete de saída
  g.fillRect(porta.x - 14, porta.y - 12, 28, 24);
}

export function desenharMovel(scene: Phaser.Scene, r: Retangulo, tipo: TipoDeMovel) {
  const g = scene.add.graphics({ x: r.x, y: r.y }).setDepth(profundidadeNoMundo(r.y + r.altura / 2));
  const l = r.largura / 2 - 2;
  const a = r.altura / 2 - 2;
  g.fillStyle(COR_DO_MOVEL[tipo], 1);
  if (tipo === 'barril') {
    g.fillCircle(0, 0, 13);
    g.lineStyle(2, 0x3a2410, 1);
    g.strokeCircle(0, 0, 13);
    return;
  }
  if (tipo === 'alcapao') {
    g.fillRect(-l, -a, l * 2, a * 2);
    g.lineStyle(2, 0x8a8a8a, 1);
    g.lineBetween(-l, -a, l, a);
    g.lineBetween(l, -a, -l, a);
    return;
  }
  g.fillRect(-l, -a, l * 2, a * 2);
  if (tipo === 'cama') {
    g.fillStyle(0xf0eadc, 1);
    g.fillRect(-l + 4, -a + 4, l * 2 - 8, 14);
  } else if (tipo === 'lareira' || tipo === 'fogao') {
    g.fillStyle(0xe07020, 1);
    g.fillRect(-l / 2, -a / 2 + 4, l, a);
  } else if (tipo === 'estante') {
    g.fillStyle(0x3a2410, 1);
    for (let x = -l + 4; x < l - 4; x += 10) g.fillRect(x, -a + 3, 6, a * 2 - 6);
  }
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
