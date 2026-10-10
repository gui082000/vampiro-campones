import type Phaser from 'phaser';
import spriteUrl from '../assets/Moviment.png';

export const CHAVE_JOGADOR = 'jogador';

export type Direcao = 'baixo' | 'lado' | 'cima';

// Folha src/assets/Moviment.png: 6 quadros por linha, cada quadro com 48x32.
// Linhas usadas para andar: frente (para baixo), lado e costas (para cima).
const LARGURA_QUADRO = 48;
const ALTURA_QUADRO = 32;
const QUADROS_POR_LINHA = 6;
const LINHA: Record<Direcao, number> = { baixo: 1, lado: 2, cima: 4 };

// Na folha, o andar de lado está virado para a esquerda; para a direita, espelhamos
export const LADO_VIRADO_PARA_ESQUERDA = true;

export const ESCALA_JOGADOR = 2;

// Hitbox só nos pés, em pixels do quadro (antes da escala)
export const PES_JOGADOR = { largura: 14, altura: 10, x: 17, y: 18 };

// Onde ficam os pés em relação ao centro do sprite, já na escala do jogo (pixels)
export const CENTRO_DOS_PES = {
  x: (PES_JOGADOR.x + PES_JOGADOR.largura / 2 - LARGURA_QUADRO / 2) * ESCALA_JOGADOR,
  y: (PES_JOGADOR.y + PES_JOGADOR.altura / 2 - ALTURA_QUADRO / 2) * ESCALA_JOGADOR,
};

export function carregarPersonagem(scene: Phaser.Scene) {
  scene.load.spritesheet(CHAVE_JOGADOR, spriteUrl, {
    frameWidth: LARGURA_QUADRO,
    frameHeight: ALTURA_QUADRO,
  });
}

export function animacaoAndar(direcao: Direcao): string {
  return `jogador-andar-${direcao}`;
}

// Quadro usado quando o Tomás está parado olhando para essa direção
export function quadroParado(direcao: Direcao): number {
  return LINHA[direcao] * QUADROS_POR_LINHA;
}

export function criarAnimacoesPersonagem(scene: Phaser.Scene) {
  for (const direcao of Object.keys(LINHA) as Direcao[]) {
    const chave = animacaoAndar(direcao);
    if (scene.anims.exists(chave)) continue;

    const inicio = quadroParado(direcao);
    scene.anims.create({
      key: chave,
      frames: scene.anims.generateFrameNumbers(CHAVE_JOGADOR, {
        start: inicio,
        end: inicio + QUADROS_POR_LINHA - 1,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }
}
