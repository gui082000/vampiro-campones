import type Phaser from 'phaser';
import { CAMADA } from '../arte/Camadas';
import { ALTURA, LARGURA } from '../config';
import { FERRAMENTAS, NOME_FERRAMENTA } from '../dados/ferramentas';
import type { Inventario } from '../estado/Inventario';
import type { Interacao } from '../sistemas/Interacao';
import type { Relogio } from '../sistemas/Relogio';

const ESTILO_TEXTO: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'monospace',
  fontSize: '18px',
  color: '#ffffff',
  backgroundColor: '#000000aa',
  padding: { x: 8, y: 4 },
};

const COR_DIA = '#ffffff';
const COR_NOITE = '#ff6b6b';

// Todos os textos fixos na tela: relógio, recursos, ferramentas e a dica de interação.
// Só lê o estado do jogo; não muda nada.
export class Hud {
  private relogio: Relogio;
  private inventario: Inventario;
  private interacao: Interacao;

  private textoRelogio: Phaser.GameObjects.Text;
  private textoRecursos: Phaser.GameObjects.Text;
  private textoFerramentas: Phaser.GameObjects.Text;
  private textoDica: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, relogio: Relogio, inventario: Inventario, interacao: Interacao) {
    this.relogio = relogio;
    this.inventario = inventario;
    this.interacao = interacao;

    const texto = (x: number, y: number) =>
      scene.add.text(x, y, '', ESTILO_TEXTO).setScrollFactor(0).setDepth(CAMADA.hud);

    this.textoRelogio = texto(12, 12);
    this.textoRecursos = texto(12, 50);
    this.textoFerramentas = texto(12, 88);
    this.textoDica = texto(LARGURA / 2, ALTURA - 30).setOrigin(0.5);

    // A cor do relógio acompanha a vida do Tomás: branco de dia, vermelho à noite
    this.textoRelogio.setColor(relogio.eNoite ? COR_NOITE : COR_DIA);
    relogio.ouvir('anoiteceu', () => this.textoRelogio.setColor(COR_NOITE));
    relogio.ouvir('amanheceu', () => this.textoRelogio.setColor(COR_DIA));
  }

  atualizar() {
    const { dia, horario, eNoite } = this.relogio;
    this.textoRelogio.setText(`Dia ${dia} · ${horario} · ${eNoite ? 'Vampiro' : 'Camponês'}`);

    const { sementes, trigo, moedas, ferramenta } = this.inventario;
    this.textoRecursos.setText(`Sementes: ${sementes}  Trigo: ${trigo}  Moedas: ${moedas}`);

    const barra = FERRAMENTAS.map((f, i) => {
      const nome = `${i + 1}:${NOME_FERRAMENTA[f]}`;
      return f === ferramenta ? `[${nome}]` : ` ${nome} `;
    });
    this.textoFerramentas.setText(barra.join(' '));

    this.textoDica.setText(this.interacao.dica).setVisible(this.interacao.dica !== '');
  }
}
