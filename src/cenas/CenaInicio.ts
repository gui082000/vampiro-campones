import Phaser from 'phaser';
import { ALTURA, LARGURA } from '../config';
import { Menu } from '../interface/Menu';
import { mostrarControles } from '../sistemas/Pausa';
import { existeSave, lerSave } from '../sistemas/Salvar';
import { Controle } from '../util/Controle';

// Tela inicial: título, novo jogo, continuar (se houver save) e controles.
export class CenaInicio extends Phaser.Scene {
  private menu!: Menu;

  constructor() {
    super('CenaInicio');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0a0608');
    const lua = this.add.circle(LARGURA - 150, 110, 46, 0xe8e0d0);
    this.add.circle(LARGURA - 130, 98, 46, 0x0a0608); // lua minguante
    lua.setAlpha(0.9);
    this.add
      .text(LARGURA / 2, 34, 'Sangue na Terra', { fontFamily: 'monospace', fontSize: '40px', color: '#c03030' })
      .setOrigin(0.5);
    this.add
      .text(LARGURA / 2, 72, 'De dia, camponês. À noite, a fome.', { fontFamily: 'monospace', fontSize: '14px', color: '#a89a88' })
      .setOrigin(0.5);
    this.add
      .text(LARGURA / 2, ALTURA - 20, 'W/S: escolher   E ou Enter: confirmar', { fontFamily: 'monospace', fontSize: '11px', color: '#6a6a6a' })
      .setOrigin(0.5);

    this.menu = new Menu(this, new Controle());
    const salvo = lerSave();
    this.menu.abrir('Vale Cinzento espera por você', () => [
      ...(existeSave()
        ? [
            {
              texto: 'Continuar',
              detalhe: `Último save: ${salvo?.salvoEm ?? ''}`,
              aoEscolher: () => void this.scene.start('CenaPrincipal', { carregar: true }),
            },
          ]
        : []),
      {
        texto: 'Novo jogo',
        detalhe: existeSave() ? 'Começa do zero. O save antigo só é apagado quando o jogo salvar de novo.' : 'Tomás chega à fazenda do tio.',
        aoEscolher: () => void this.scene.start('CenaPrincipal', { carregar: false }),
      },
      { texto: 'Controles', aoEscolher: () => mostrarControles(this.menu, () => void this.scene.restart()) },
    ]);
  }

  update() {
    this.menu.atualizar();
    if (!this.menu.estaAberto) this.scene.restart(); // Esc fechou o menu: reabre
  }
}
