import Phaser from 'phaser';
import { VELOCIDADE_JOGADOR } from './config';
import spriteUrl from '../assets/Moviment.png';

export const CHAVE_JOGADOR = 'jogador';
const COLUNAS = 6;
// Linhas da folha (cada quadro tem 48x32): frente, lado (virado para a esquerda) e costas
const LINHA = { baixo: 1, lado: 2, cima: 4 } as const;

type Direcao = keyof typeof LINHA;

// Cria o sprite animado do jogador e controla seu movimento por teclado (setas ou WASD).
export class Jogador {
  sprite: Phaser.Physics.Arcade.Sprite;

  private setas: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private direcao: Direcao = 'baixo';

  static carregar(scene: Phaser.Scene) {
    scene.load.spritesheet(CHAVE_JOGADOR, spriteUrl, { frameWidth: 48, frameHeight: 32 });
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    for (const [nome, linha] of Object.entries(LINHA)) {
      const inicio = linha * COLUNAS;
      scene.anims.create({
        key: `andar-${nome}`,
        frames: scene.anims.generateFrameNumbers(CHAVE_JOGADOR, { start: inicio, end: inicio + COLUNAS - 1 }),
        frameRate: 10,
        repeat: -1,
      });
    }

    this.sprite = scene.physics.add.sprite(x, y, CHAVE_JOGADOR, LINHA.baixo * COLUNAS);
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(2);
    this.sprite.setScale(2);
    // Hitbox só nos pés, para o personagem passar perto de paredes sem travar
    this.sprite.body!.setSize(14, 10);
    this.sprite.body!.setOffset(17, 18);

    this.setas = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys('W,A,S,D') as typeof this.wasd;
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  atualizar() {
    let x = 0;
    let y = 0;

    if (this.setas.left.isDown || this.wasd.A.isDown) x -= 1;
    if (this.setas.right.isDown || this.wasd.D.isDown) x += 1;
    if (this.setas.up.isDown || this.wasd.W.isDown) y -= 1;
    if (this.setas.down.isDown || this.wasd.S.isDown) y += 1;

    const direcao = new Phaser.Math.Vector2(x, y).normalize();
    this.sprite.setVelocity(direcao.x * VELOCIDADE_JOGADOR, direcao.y * VELOCIDADE_JOGADOR);

    if (x === 0 && y === 0) {
      // Parado: congela no primeiro quadro da direção atual
      this.sprite.anims.stop();
      this.sprite.setFrame(LINHA[this.direcao] * COLUNAS);
      return;
    }

    if (x !== 0) {
      this.direcao = 'lado';
      this.sprite.setFlipX(x > 0);
    } else {
      this.direcao = y < 0 ? 'cima' : 'baixo';
    }
    this.sprite.anims.play(`andar-${this.direcao}`, true);
  }
}
