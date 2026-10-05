import Phaser from 'phaser';
import { VELOCIDADE_JOGADOR } from './config';

// Cria o sprite provisório do jogador e controla seu movimento por teclado (setas ou WASD).
export class Jogador {
  sprite: Phaser.Physics.Arcade.Sprite;

  private setas: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const g = scene.add.graphics();
    g.fillStyle(0xc89b6d, 1);
    g.fillRect(0, 0, 28, 28);
    g.generateTexture('jogador', 28, 28);
    g.destroy();

    this.sprite = scene.physics.add.sprite(x, y, 'jogador');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(2);

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
  }
}
