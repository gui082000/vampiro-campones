import Phaser from 'phaser';

const VELOCIDADE_ALDEAO = 40;
const RAIO_PASSEIO = 60; // o quão longe do ponto de origem o aldeão se afasta andando

// NPC simples: um círculo colorido que fica andando sem rumo perto de um ponto de origem
// (a casa dele). Sem diálogo ou rotina ainda — isso vem numa próxima mecânica.
export class Aldeao {
  sprite: Phaser.Physics.Arcade.Sprite;

  private origem: Phaser.Math.Vector2;
  private proximaTrocaDeDirecao = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, cor: number) {
    const chaveTextura = `aldeao-${cor.toString(16)}`;

    if (!scene.textures.exists(chaveTextura)) {
      const g = scene.add.graphics();
      g.fillStyle(cor, 1);
      g.fillCircle(12, 12, 12);
      g.generateTexture(chaveTextura, 24, 24);
      g.destroy();
    }

    this.sprite = scene.physics.add.sprite(x, y, chaveTextura);
    this.origem = new Phaser.Math.Vector2(x, y);
  }

  atualizar(tempo: number) {
    if (tempo > this.proximaTrocaDeDirecao) {
      this.proximaTrocaDeDirecao = tempo + Phaser.Math.Between(1500, 3500);

      const distanciaDaOrigem = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        this.origem.x,
        this.origem.y,
      );

      if (distanciaDaOrigem > RAIO_PASSEIO) {
        // Longe demais: volta para perto de casa
        const direcao = this.origem.clone().subtract(this.sprite.body!.position).normalize();
        this.sprite.setVelocity(direcao.x * VELOCIDADE_ALDEAO, direcao.y * VELOCIDADE_ALDEAO);
      } else if (Phaser.Math.Between(0, 3) === 0) {
        // Às vezes para um pouco
        this.sprite.setVelocity(0, 0);
      } else {
        const angulo = Phaser.Math.FloatBetween(0, Math.PI * 2);
        this.sprite.setVelocity(Math.cos(angulo) * VELOCIDADE_ALDEAO, Math.sin(angulo) * VELOCIDADE_ALDEAO);
      }
    }
  }
}
