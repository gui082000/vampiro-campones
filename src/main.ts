import Phaser from 'phaser';
import './style.css';

const VELOCIDADE = 160;

// Tempo do jogo
const SEGUNDOS_POR_HORA = 5; // 1 hora do jogo = 5 segundos reais (dia completo = 2 minutos)
const HORA_INICIAL = 7;
const ESCURIDAO_MAXIMA = 0.7;

// Fazenda
const TAMANHO_CANTEIRO = 40;
const DISTANCIA_INTERACAO = 48;
const HORAS_PARA_CRESCER = 24; // horas do jogo (1 dia inteiro)
const SEMENTES_INICIAIS = 5;

function escuridaoDaHora(hora: number): number {
  if (hora >= 8 && hora < 17) return 0;
  if (hora >= 17 && hora < 20) return (hora - 17) / 3;
  if (hora >= 20 || hora < 5) return 1;
  return 1 - (hora - 5) / 3;
}

interface Canteiro {
  x: number;
  y: number;
  plantado: boolean;
  horasCrescendo: number;
  solo: Phaser.GameObjects.Rectangle;
  planta: Phaser.GameObjects.Rectangle;
}

class CenaPrincipal extends Phaser.Scene {
  private jogador!: Phaser.Physics.Arcade.Sprite;
  private setas!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private teclaE!: Phaser.Input.Keyboard.Key;

  private hora = HORA_INICIAL;
  private dia = 1;
  private camadaEscura!: Phaser.GameObjects.Rectangle;
  private textoRelogio!: Phaser.GameObjects.Text;

  private canteiros: Canteiro[] = [];
  private sementes = SEMENTES_INICIAIS;
  private colheitas = 0;
  private textoInventario!: Phaser.GameObjects.Text;
  private textoDica!: Phaser.GameObjects.Text;

  constructor() {
    super('CenaPrincipal');
  }

  create() {
    // Chão provisório
    this.add.grid(400, 300, 800, 600, 32, 32, 0x2d5a27, 1, 0x234a1f, 1);

    // Canteiros ficam antes do jogador para o jogador aparecer por cima
    this.criarCanteiros();

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
    this.teclaE = this.input.keyboard!.addKey('E');

    // Escurecimento da noite
    this.camadaEscura = this.add
      .rectangle(0, 0, 800, 600, 0x0a0a2a, 0)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(10);

    // Interface
    const estiloTexto = {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 },
    };

    this.textoRelogio = this.add.text(12, 12, '', estiloTexto).setScrollFactor(0).setDepth(11);
    this.textoInventario = this.add.text(12, 50, '', estiloTexto).setScrollFactor(0).setDepth(11);
    this.textoDica = this.add
      .text(400, 570, '', estiloTexto)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(11);

    this.atualizarInventario();
  }

  update(_tempo: number, delta: number) {
    this.atualizarMovimento();
    const deltaHoras = this.atualizarRelogio(delta);
    this.atualizarCanteiros(deltaHoras);
    this.atualizarInteracao();
  }

  // ---------- Fazenda ----------

  private criarCanteiros() {
    const colunas = 4;
    const linhas = 2;
    const inicioX = 292;
    const inicioY = 440;
    const espaco = 52;

    for (let l = 0; l < linhas; l++) {
      for (let c = 0; c < colunas; c++) {
        const x = inicioX + c * espaco;
        const y = inicioY + l * espaco;

        const solo = this.add.rectangle(x, y, TAMANHO_CANTEIRO, TAMANHO_CANTEIRO, 0x5a3b1e);
        const planta = this.add.rectangle(x, y, 4, 4, 0x6abe30).setVisible(false);

        this.canteiros.push({ x, y, plantado: false, horasCrescendo: 0, solo, planta });
      }
    }
  }

  private atualizarCanteiros(deltaHoras: number) {
    for (const c of this.canteiros) {
      if (!c.plantado) continue;
      c.horasCrescendo = Math.min(c.horasCrescendo + deltaHoras, HORAS_PARA_CRESCER);
      this.desenharCanteiro(c);
    }
  }

  private desenharCanteiro(c: Canteiro) {
    if (!c.plantado) {
      c.solo.setFillStyle(0x5a3b1e);
      c.planta.setVisible(false);
      return;
    }

    const progresso = c.horasCrescendo / HORAS_PARA_CRESCER;
    const pronto = progresso >= 1;
    const tamanho = 6 + progresso * 22;

    c.solo.setFillStyle(0x4a2f17);
    c.planta.setVisible(true);
    c.planta.setSize(tamanho, tamanho);
    c.planta.setFillStyle(pronto ? 0xf2c230 : 0x6abe30);
  }

  private canteiroMaisProximo(): Canteiro | null {
    let melhor: Canteiro | null = null;
    let menorDistancia = DISTANCIA_INTERACAO;

    for (const c of this.canteiros) {
      const d = Phaser.Math.Distance.Between(this.jogador.x, this.jogador.y, c.x, c.y);
      if (d < menorDistancia) {
        menorDistancia = d;
        melhor = c;
      }
    }
    return melhor;
  }

  private atualizarInteracao() {
    const alvo = this.canteiroMaisProximo();

    // Destaque amarelo no canteiro mais próximo
    for (const c of this.canteiros) {
      if (c === alvo) c.solo.setStrokeStyle(2, 0xffee55);
      else c.solo.setStrokeStyle();
    }

    if (!alvo) {
      this.textoDica.setText('');
      return;
    }

    const pronto = alvo.plantado && alvo.horasCrescendo >= HORAS_PARA_CRESCER;

    if (!alvo.plantado) {
      this.textoDica.setText(this.sementes > 0 ? 'E: plantar semente' : 'Sem sementes');
    } else if (pronto) {
      this.textoDica.setText('E: colher');
    } else {
      const pct = Math.floor((alvo.horasCrescendo / HORAS_PARA_CRESCER) * 100);
      this.textoDica.setText(`Crescendo... ${pct}%`);
    }

    if (!Phaser.Input.Keyboard.JustDown(this.teclaE)) return;

    if (!alvo.plantado && this.sementes > 0) {
      alvo.plantado = true;
      alvo.horasCrescendo = 0;
      this.sementes -= 1;
    } else if (pronto) {
      alvo.plantado = false;
      alvo.horasCrescendo = 0;
      this.colheitas += 1;
      this.sementes += 1; // por enquanto cada colheita devolve uma semente
    }

    this.desenharCanteiro(alvo);
    this.atualizarInventario();
  }

  private atualizarInventario() {
    this.textoInventario.setText(`Sementes: ${this.sementes}  Colheita: ${this.colheitas}`);
  }

  // ---------- Movimento ----------

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

  // ---------- Relógio ----------

  // Devolve quantas horas do jogo passaram neste quadro
  private atualizarRelogio(delta: number): number {
    const deltaHoras = delta / 1000 / SEGUNDOS_POR_HORA;
    const horaAntes = this.hora;
    this.hora += deltaHoras;

    if (this.hora >= 24) this.hora -= 24;
    if (horaAntes < 6 && this.hora >= 6) this.dia += 1;

    const escuridao = escuridaoDaHora(this.hora);
    this.camadaEscura.setAlpha(escuridao * ESCURIDAO_MAXIMA);

    const eNoite = escuridao > 0.5;
    const h = Math.floor(this.hora).toString().padStart(2, '0');
    const m = Math.floor((this.hora % 1) * 60).toString().padStart(2, '0');

    this.textoRelogio.setText(`Dia ${this.dia} · ${h}:${m} · ${eNoite ? 'Vampiro' : 'Camponês'}`);
    this.textoRelogio.setColor(eNoite ? '#ff6b6b' : '#ffffff');

    return deltaHoras;
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
