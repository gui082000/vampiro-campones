import type Phaser from 'phaser';
import { ITENS, type IdItem } from '../dados/itens';

// Ícones provisórios dos itens: um quadrado arredondado na cor do item (a sigla é
// escrita por cima por quem mostra o ícone). Para usar desenhos de verdade, troque
// a textura de cada item aqui mantendo a chave.
export const TAMANHO_ICONE = 32;

export function chaveDoIcone(item: IdItem): string {
  return `icone-${item}`;
}

function escurecer(cor: number, fator: number): number {
  const r = Math.floor(((cor >> 16) & 0xff) * fator);
  const g = Math.floor(((cor >> 8) & 0xff) * fator);
  const b = Math.floor((cor & 0xff) * fator);
  return (r << 16) | (g << 8) | b;
}

export function criarIcones(scene: Phaser.Scene) {
  for (const item of Object.keys(ITENS) as IdItem[]) {
    const chave = chaveDoIcone(item);
    if (scene.textures.exists(chave)) continue;
    const cor = ITENS[item].cor;
    const g = scene.add.graphics();
    g.fillStyle(cor, 1);
    g.fillRoundedRect(1, 1, TAMANHO_ICONE - 2, TAMANHO_ICONE - 2, 7);
    g.lineStyle(2, escurecer(cor, 0.55), 1);
    g.strokeRoundedRect(1, 1, TAMANHO_ICONE - 2, TAMANHO_ICONE - 2, 7);
    g.generateTexture(chave, TAMANHO_ICONE, TAMANHO_ICONE);
    g.destroy();
  }
}
