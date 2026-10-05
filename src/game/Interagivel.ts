import Phaser from 'phaser';

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
