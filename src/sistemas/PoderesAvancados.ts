import Phaser from 'phaser';
import { POUSOS_DO_MORCEGO } from '../dados/clima';
import { impedeOVoo, virarNevoa, voarComoMorcego } from '../estado/Vampiro';
import type { Transicao } from '../interface/Transicao';
import type { Interiores } from './Interiores';
import type { Jogador } from './Jogador';
import type { Mundo } from './Mundo';

// Os poderes comprados no altar que se usam com uma tecla: V vira névoa (ninguém vê
// o Tomás por uma hora) e B vira morcego (voa para um lugar conhecido).
export class PoderesAvancados {
  private mundo: Mundo;
  private jogador: Jogador;
  private interiores: Interiores;
  private transicao: Transicao;
  private teclaNevoa: Phaser.Input.Keyboard.Key;
  private teclaMorcego: Phaser.Input.Keyboard.Key;

  constructor(mundo: Mundo, jogador: Jogador, interiores: Interiores, transicao: Transicao) {
    this.mundo = mundo;
    this.jogador = jogador;
    this.interiores = interiores;
    this.transicao = transicao;
    const teclado = mundo.cena.input.keyboard!;
    this.teclaNevoa = teclado.addKey('V');
    this.teclaMorcego = teclado.addKey('B');
  }

  atualizar() {
    const { controle, vampiro, relogio, avisos } = this.mundo;
    const nevoa = Phaser.Input.Keyboard.JustDown(this.teclaNevoa);
    const morcego = Phaser.Input.Keyboard.JustDown(this.teclaMorcego);
    if (!controle.livre) return;
    if (nevoa) avisos.mostrar(virarNevoa(vampiro, relogio.eNoite).aviso);
    if (morcego) this.abrirVoo();
  }

  private abrirVoo() {
    const { menu, vampiro, relogio, avisos } = this.mundo;
    const impede = impedeOVoo(vampiro, relogio.eNoite, this.interiores.local === 'fora');
    if (impede !== null) {
      if (impede) avisos.mostrar(impede);
      return;
    }
    menu.abrir('Voar como morcego para...', () => [
      ...POUSOS_DO_MORCEGO.map((pouso) => ({
        texto: pouso.nome,
        aoEscolher: () => {
          avisos.mostrar(voarComoMorcego(vampiro).aviso);
          this.transicao.escurecerE(() => this.jogador.teleportar(pouso.coluna, pouso.linha, 'baixo'));
          return 'fechar' as const;
        },
      })),
      { texto: 'Ficar aqui', aoEscolher: () => 'fechar' as const },
    ]);
  }
}
