import Phaser from 'phaser';
import { VELOCIDADE_JOGADOR } from '../config';
import { profundidadeNoMundo } from '../arte/Camadas';
import {
  CENTRO_DOS_PES,
  CHAVE_JOGADOR,
  ESCALA_JOGADOR,
  LADO_VIRADO_PARA_ESQUERDA,
  PES_JOGADOR,
  animacaoAndar,
  criarAnimacoesPersonagem,
  quadroParado,
  type Direcao,
} from '../arte/Personagem';
import { TAMANHO_CELULA } from './Mapa';

export type Olhar = 'baixo' | 'cima' | 'esquerda' | 'direita';

const PASSO: Record<Olhar, [number, number]> = {
  baixo: [0, 1],
  cima: [0, -1],
  esquerda: [-1, 0],
  direita: [1, 0],
};

// Cria o Tomás e controla seu movimento por teclado (setas ou WASD), escolhendo a
// animação de acordo com a direção. Guarda para onde ele está olhando: é a célula
// à frente dele que recebe a ação da tecla E.
export class Jogador {
  sprite: Phaser.Physics.Arcade.Sprite;
  olhar: Olhar = 'baixo';

  private setas: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private direcao: Direcao = 'baixo';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    criarAnimacoesPersonagem(scene);

    this.sprite = scene.physics.add.sprite(x, y, CHAVE_JOGADOR, quadroParado(this.direcao));
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(ESCALA_JOGADOR);
    // Hitbox só nos pés, para o personagem passar perto de paredes sem travar
    this.sprite.body!.setSize(PES_JOGADOR.largura, PES_JOGADOR.altura);
    this.sprite.body!.setOffset(PES_JOGADOR.x, PES_JOGADOR.y);

    this.setas = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys('W,A,S,D') as typeof this.wasd;
  }

  get x() {
    return this.sprite.x;
  }

  get y() {
    return this.sprite.y;
  }

  // Célula onde estão os pés
  get celulaDosPes(): { coluna: number; linha: number } {
    return {
      coluna: Math.floor((this.sprite.x + CENTRO_DOS_PES.x) / TAMANHO_CELULA),
      linha: Math.floor((this.sprite.y + CENTRO_DOS_PES.y) / TAMANHO_CELULA),
    };
  }

  // Célula à frente, para onde ele está olhando
  get celulaDaFrente(): { coluna: number; linha: number } {
    const { coluna, linha } = this.celulaDosPes;
    const [dx, dy] = PASSO[this.olhar];
    return { coluna: coluna + dx, linha: linha + dy };
  }

  // livre: falso enquanto há um menu aberto ou ele está ocupado (pescando, dormindo)
  atualizar(livre: boolean) {
    let x = 0;
    let y = 0;

    if (livre) {
      if (this.setas.left.isDown || this.wasd.A.isDown) x -= 1;
      if (this.setas.right.isDown || this.wasd.D.isDown) x += 1;
      if (this.setas.up.isDown || this.wasd.W.isDown) y -= 1;
      if (this.setas.down.isDown || this.wasd.S.isDown) y += 1;
    }

    const direcao = new Phaser.Math.Vector2(x, y).normalize();
    this.sprite.setVelocity(direcao.x * VELOCIDADE_JOGADOR, direcao.y * VELOCIDADE_JOGADOR);
    this.sprite.setDepth(profundidadeNoMundo(this.sprite.y + CENTRO_DOS_PES.y));

    if (x === 0 && y === 0) {
      // Parado: congela no primeiro quadro da direção atual
      this.sprite.anims.stop();
      this.sprite.setFrame(quadroParado(this.direcao));
      return;
    }

    if (x !== 0) {
      this.direcao = 'lado';
      this.olhar = x < 0 ? 'esquerda' : 'direita';
      this.sprite.setFlipX(LADO_VIRADO_PARA_ESQUERDA ? x > 0 : x < 0);
    } else {
      this.direcao = y < 0 ? 'cima' : 'baixo';
      this.olhar = this.direcao === 'cima' ? 'cima' : 'baixo';
    }
    this.sprite.anims.play(animacaoAndar(this.direcao), true);
  }
}
