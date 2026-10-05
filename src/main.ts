import Phaser from 'phaser';
import './style.css';

const VELOCIDADE = 160;

// Tempo do jogo
const SEGUNDOS_POR_HORA = 5; // 1 hora do jogo = 5 segundos reais (dia completo = 2 minutos)
const HORA_INICIAL = 7;
const ESCURIDAO_MAXIMA = 0.7; // 0 = claro, 1 = preto total

// Devolve de 0 a 1 o quanto está escuro naquela hora
function escuridaoDaHora(hora: number): number {
  if (hora >= 8 && hora < 17) return 0; // dia pleno
  if (hora >= 17 && hora < 20) return (hora - 17) / 3; // entardecer
  if (hora >= 20 || hora < 5) return 1; // noite
  return 1 - (hora - 5) / 3; // amanhecer (5h às 8h)
}

class CenaPrincipal extends Phaser.Scene {
  private jogador!: Phaser.Physics.Arcade.Sprite;
  private setas!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

  private hora = HORA_INICIAL;
  private dia = 1;
  private camadaEscura!: Phaser.GameObjects.Rectangle;
  private textoRelogio!: Phaser.GameObjects.Text;

  constructor() {
    super('CenaPrincipal');
  }

  create() {
    // Chão provisório
    this.add.grid(400, 300, 800, 600, 32, 32, 0x2d5a27, 1, 0x234a1f, 1);

    // Personagem provisório
    const g = this.add.graphics();
    g.fillStyle(0xc89b6d, 1);
    g.fillRect(0, 0, 28, 28);
    g.generateTexture('jogador', 28, 28);
    g.destroy();

    this.jogador = this.physics.add.sprite(400, 300, 'jogador');
    this.jogador.setCollideWorldBounds(true);

    this.setas = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as typeof this.wasd;

    // Camada azul-escura por cima de tudo, que vai ficando mais opaca à noite
    this.camadaEscura = this.add
      .rectangle(0, 0, 800, 600, 0x0a0a2a, 0)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(10);

    // Relógio no canto da tela
    this.textoRelogio = this.add
      .text(12, 12, '', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0)
      .setDepth(11);
  }

  update(_tempo: number, delta: number) {
    this.atualizarMovimento();
    this.atualizarRelogio(delta);
  }

  private atualizarMovimento() {
    let x = 0;
    let y = 0;

    if (this.setas.left.isDown || this.wasd.A.isDown) x -= 1;
    if (this.setas.right.isDown || this.wasd.D.isDown) x += 1;
    if (this.setas.up.isDown || this.wasd.W.isDown) y -= 1;
    if (this.setas.down.isDown || this.wasd.S.isDown) y += 1;

    const direcao = new Phaser.Math.Vector2(x, y).normalize();
    this.jogador.setVelocity(direcao.x * VELOCIDADE, direcao.y * VELOCIDADE);
  }

  private atualizarRelogio(delta: number) {
    const horaAntes = this.hora;
    this.hora += delta / 1000 / SEGUNDOS_POR_HORA;

    if (this.hora >= 24) this.hora -= 24;
    // Um novo dia começa quando o relógio passa das 6h
    if (horaAntes < 6 && this.hora >= 6) this.dia += 1;

    const escuridao = escuridaoDaHora(this.hora);
    this.camadaEscura.setAlpha(escuridao * ESCURIDAO_MAXIMA);

    const eNoite = escuridao > 0.5;
    const h = Math.floor(this.hora).toString().padStart(2, '0');
    const m = Math.floor((this.hora % 1) * 60).toString().padStart(2, '0');

    this.textoRelogio.setText(`Dia ${this.dia} · ${h}:${m} · ${eNoite ? 'Vampiro' : 'Camponês'}`);
    this.textoRelogio.setColor(eNoite ? '#ff6b6b' : '#ffffff');
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'app',
  backgroundColor: '#1a3a17',
  pixelArt: true,
  physics: { default: 'arcade' },
  scene: CenaPrincipal,
});
