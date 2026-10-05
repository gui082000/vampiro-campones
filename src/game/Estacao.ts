import Phaser from 'phaser';
import { PRECO_SEMENTE, PRECO_VENDA } from './config';
import type { Interagivel } from './Interagivel';
import type { Inventario } from './Inventario';
import { criarEstrutura } from './Estrutura';
import { FRAME, TILE } from './Tileset';

function rotulo(scene: Phaser.Scene, x: number, y: number, nome: string) {
  scene.add
    .text(x, y, nome, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 4, y: 2 },
    })
    .setOrigin(0.5)
    .setDepth(2);
}

// Uma estação é um ponto fixo no mapa com o qual o jogador troca recursos (comprar, vender, etc).
// A "destaque" é um retângulo invisível do tamanho da estrutura: só aparece quando o
// jogador chega perto (serve de contorno amarelo), a arte de verdade fica por cima.
export function criarBarracaDeSementes(
  scene: Phaser.Scene,
  inventario: Inventario,
  x: number,
  y: number,
): Interagivel {
  const largura = FRAME.barraca[0].length * TILE;
  const altura = FRAME.barraca.length * TILE;

  const areaDeDestaque = scene.add.rectangle(x, y, largura, altura, 0x000000, 0).setDepth(1);
  criarEstrutura(scene, FRAME.barraca, x - largura / 2, y - altura / 2, 2);
  rotulo(scene, x, y - altura / 2 - 14, 'Barraca de sementes');

  return {
    x,
    y,
    raio: Math.max(largura, altura) + 24,
    destaque: areaDeDestaque,
    dica: () =>
      inventario.moedas >= PRECO_SEMENTE
        ? `E: comprar 1 semente (${PRECO_SEMENTE} moedas)`
        : `Semente custa ${PRECO_SEMENTE} moedas`,
    acao: () => {
      if (inventario.moedas < PRECO_SEMENTE) return;
      inventario.moedas -= PRECO_SEMENTE;
      inventario.sementes += 1;
      inventario.atualizarHud();
    },
  };
}

// O trecho do tileset com caixotes/baús não está alinhado numa grade de 32px (os
// sprites se sobrepõem entre colunas), então aqui usamos um retângulo estilizado
// em vez de arriscar recortar duas peças coladas.
export function criarCaixaDeVenda(
  scene: Phaser.Scene,
  inventario: Inventario,
  x: number,
  y: number,
): Interagivel {
  const largura = 56;
  const altura = 44;

  const caixa = scene.add.rectangle(x, y, largura, altura, 0x8b5a2b);
  scene.add.rectangle(x, y - altura / 2 + 6, largura - 10, 4, 0x6b4423);
  rotulo(scene, x, y - altura / 2 - 14, 'Caixa de venda');

  return {
    x,
    y,
    raio: Math.max(largura, altura) + 40,
    destaque: caixa,
    dica: () =>
      inventario.trigo > 0
        ? `E: vender ${inventario.trigo} trigo por ${inventario.trigo * PRECO_VENDA} moedas`
        : 'Nada para vender',
    acao: () => {
      if (inventario.trigo === 0) return;
      inventario.moedas += inventario.trigo * PRECO_VENDA;
      inventario.trigo = 0;
      inventario.atualizarHud();
    },
  };
}
