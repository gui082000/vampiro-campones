import Phaser from 'phaser';
import { ESCURIDAO_MAXIMA, HORA_INICIAL, HORA_SECAR, SEGUNDOS_POR_HORA } from './config';

// Devolve de 0 a 1 o quanto está escuro naquela hora
function escuridaoDaHora(hora: number): number {
  if (hora >= 8 && hora < 17) return 0;
  if (hora >= 17 && hora < 20) return (hora - 17) / 3;
  if (hora >= 20 || hora < 5) return 1;
  return 1 - (hora - 5) / 3;
}

// Controla hora, dia, o escurecimento da tela e o texto do relógio.
// Avisa quem precisar saber quando um novo dia começa (ex: a fazenda, para secar a rega).
export class Relogio {
  private hora = HORA_INICIAL;
  private dia = 1;
  private camadaEscura: Phaser.GameObjects.Rectangle;
  private texto: Phaser.GameObjects.Text;
  private aoComecarNovoDia: () => void;

  constructor(
    scene: Phaser.Scene,
    largura: number,
    altura: number,
    estiloTexto: Phaser.Types.GameObjects.Text.TextStyle,
    aoComecarNovoDia: () => void,
  ) {
    this.aoComecarNovoDia = aoComecarNovoDia;

    this.camadaEscura = scene.add
      .rectangle(0, 0, largura, altura, 0x0a0a2a, 0)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(10);

    this.texto = scene.add.text(12, 12, '', estiloTexto).setScrollFactor(0).setDepth(11);
  }

  // Atualiza o relógio e devolve quantas horas do jogo passaram neste quadro
  atualizar(delta: number): number {
    const deltaHoras = delta / 1000 / SEGUNDOS_POR_HORA;
    const horaAntes = this.hora;
    this.hora += deltaHoras;

    if (this.hora >= 24) this.hora -= 24;
    if (horaAntes < HORA_SECAR && this.hora >= HORA_SECAR) {
      this.dia += 1;
      this.aoComecarNovoDia();
    }

    const escuridao = escuridaoDaHora(this.hora);
    this.camadaEscura.setAlpha(escuridao * ESCURIDAO_MAXIMA);

    const eNoite = escuridao > 0.5;
    const h = Math.floor(this.hora).toString().padStart(2, '0');
    const m = Math.floor((this.hora % 1) * 60).toString().padStart(2, '0');

    this.texto.setText(`Dia ${this.dia} · ${h}:${m} · ${eNoite ? 'Vampiro' : 'Camponês'}`);
    this.texto.setColor(eNoite ? '#ff6b6b' : '#ffffff');

    return deltaHoras;
  }
}
