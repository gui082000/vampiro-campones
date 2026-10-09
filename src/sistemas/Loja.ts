import type Phaser from 'phaser';
import { PRECO_SEMENTE, PRECO_VENDA } from '../config';
import { desenharBarraca, desenharCaixaDeVenda } from '../arte/Objetos';
import { comprarSemente, venderTrigo } from '../estado/Comercio';
import type { Inventario } from '../estado/Inventario';
import { quantidade } from '../util/texto';
import type { Interagivel } from './Interacao';

const moedas = (n: number) => quantidade(n, 'moeda', 'moedas');

// Estações de troca: pontos fixos no mapa onde o jogador compra e vende com E.
// As regras ficam em estado/Comercio; aqui só se coloca cada uma no mundo.

export function criarBarracaDeSementes(
  scene: Phaser.Scene,
  inventario: Inventario,
  x: number,
  y: number,
): Interagivel {
  const destaque = desenharBarraca(scene, x, y);

  return {
    x,
    y,
    raio: Math.max(destaque.width, destaque.height) + 24,
    destaque,
    dica: () =>
      inventario.moedas >= PRECO_SEMENTE
        ? `E: comprar 1 semente (${moedas(PRECO_SEMENTE)})`
        : `Semente custa ${moedas(PRECO_SEMENTE)}`,
    acao: () => {
      comprarSemente(inventario);
    },
  };
}

export function criarCaixaDeVenda(
  scene: Phaser.Scene,
  inventario: Inventario,
  x: number,
  y: number,
): Interagivel {
  const destaque = desenharCaixaDeVenda(scene, x, y);

  return {
    x,
    y,
    raio: Math.max(destaque.width, destaque.height) + 40,
    destaque,
    dica: () =>
      inventario.trigo > 0
        ? `E: vender ${inventario.trigo} trigo por ${moedas(inventario.trigo * PRECO_VENDA)}`
        : 'Nada para vender',
    acao: () => {
      venderTrigo(inventario);
    },
  };
}
