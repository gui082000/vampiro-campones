import Phaser from 'phaser';
import { gravarOpcoes, lerOpcoes, type Opcoes } from '../estado/Opcoes';
import type { Hud } from '../interface/Hud';
import type { Menu } from '../interface/Menu';
import type { Mundo } from './Mundo';
import { armazenamento, existeSave, lerSave, type Salvar } from './Salvar';

export const CONTROLES = [
  'WASD ou setas: andar',
  'E: usar o que está à frente / confirmar',
  '1 a 8 ou rodinha do mouse: escolher o item',
  'F: comer (ou usar item do vampiro)',
  'I: inventário · J: diário',
  'Esc: pausa / fechar · Q: fechar',
  'À noite, E em quem dorme: morder',
];

// Lista as teclas num menu (cada linha uma opção apagada) com "Voltar"
export function mostrarControles(menu: Menu, voltar: () => void) {
  menu.abrir('Controles', () => [
    ...CONTROLES.map((texto) => ({ texto, ativa: false, aoEscolher: () => {} })),
    { texto: 'Voltar', aoEscolher: voltar },
  ]);
}

// Menu de pausa (Esc): continuar, salvar, carregar o último save, opções, controles e
// voltar para a tela inicial. O relógio para enquanto ele está aberto.
export class Pausa {
  private mundo: Mundo;
  private salvar: Salvar;
  private hud: Hud;
  private teclaEsc: Phaser.Input.Keyboard.Key;
  opcoes: Opcoes;

  constructor(mundo: Mundo, salvar: Salvar, hud: Hud) {
    this.mundo = mundo;
    this.salvar = salvar;
    this.hud = hud;
    this.teclaEsc = mundo.cena.input.keyboard!.addKey('ESC');
    const a = armazenamento();
    this.opcoes = a ? lerOpcoes(a) : lerOpcoes({ getItem: () => null, setItem: () => {} });
    this.aplicarOpcoes();
  }

  atualizar() {
    // Lê sempre; só abre se nada estiver usando o teclado (o menu aberto fecha com Esc sozinho)
    if (Phaser.Input.Keyboard.JustDown(this.teclaEsc) && this.mundo.controle.livre) this.abrir();
  }

  private abrir() {
    const { menu } = this.mundo;
    const cena = this.mundo.cena;
    menu.abrir('Pausa', () => [
      { texto: 'Continuar', aoEscolher: () => 'fechar' as const },
      { texto: 'Salvar o jogo', aoEscolher: () => (this.salvar.salvar(), 'fechar' as const) },
      {
        texto: 'Carregar o último save',
        detalhe: lerSave()?.salvoEm ?? 'Nenhum save ainda.',
        ativa: existeSave(),
        aoEscolher: () => {
          cena.scene.restart({ carregar: true });
          return 'fechar' as const;
        },
      },
      { texto: 'Opções...', aoEscolher: () => this.abrirOpcoes() },
      { texto: 'Controles', aoEscolher: () => mostrarControles(menu, () => this.abrir()) },
      {
        texto: 'Sair para a tela inicial',
        detalhe: 'O que não foi salvo se perde (o jogo salva sozinho toda manhã).',
        aoEscolher: () => {
          cena.scene.start('CenaInicio');
          return 'fechar' as const;
        },
      },
    ]);
  }

  private abrirOpcoes() {
    const o = this.opcoes;
    const mudar = (f: () => void) => () => {
      f();
      this.aplicarOpcoes();
      const a = armazenamento();
      if (a) gravarOpcoes(a, o);
    };
    this.mundo.menu.abrir('Opções', () => [
      { texto: `Tela cheia: ${o.telaCheia ? 'sim' : 'não'}`, aoEscolher: mudar(() => (o.telaCheia = !o.telaCheia)) },
      { texto: `Ajuda de teclas na tela: ${o.mostrarAjuda ? 'sim' : 'não'}`, aoEscolher: mudar(() => (o.mostrarAjuda = !o.mostrarAjuda)) },
      {
        texto: `Volume: ${o.volume}%`,
        detalhe: 'E aumenta (volta a 0 depois de 100). O som chega na Fase 9.',
        aoEscolher: mudar(() => (o.volume = o.volume >= 100 ? 0 : o.volume + 20)),
      },
      { texto: 'Voltar', aoEscolher: () => this.abrir() },
    ]);
  }

  private aplicarOpcoes() {
    this.hud.mostrarAjuda(this.opcoes.mostrarAjuda);
    const escala = this.mundo.cena.scale;
    if (this.opcoes.telaCheia && !escala.isFullscreen) escala.startFullscreen();
    if (!this.opcoes.telaCheia && escala.isFullscreen) escala.stopFullscreen();
  }
}
