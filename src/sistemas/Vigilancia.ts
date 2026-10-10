import type Phaser from 'phaser';
import { profundidadeNoMundo } from '../arte/Camadas';
import { DOACAO_NA_IGREJA, SUSPEITA } from '../config';
import { ARMADILHAS, ARMADILHA_ENERGIA, ARMADILHA_PRENDE_POR } from '../dados/vigilancia';
import { lerRegistro, nivel, passarDiaDaSuspeita, somarSuspeita } from '../estado/Suspeita';
import type { FimDeJogo } from '../interface/FimDeJogo';
import type { Interiores } from './Interiores';
import type { Jogador } from './Jogador';
import type { Mundo } from './Mundo';

// A vila reage ao que o Tomás faz: transforma o registro da noite em suspeita, esquece
// aos poucos, acha os corpos não escondidos, prega contra a noite, arma armadilhas na
// caça aberta e, com a suspeita em 100, vem atrás dele (final Linchado).
export class Vigilancia {
  private mundo: Mundo;
  private jogador: Jogador;
  private fim: FimDeJogo;
  private armadilhas: { coluna: number; linha: number; armada: boolean; desenho: Phaser.GameObjects.Graphics }[] = [];
  private presoAte = 0;
  private tempo = 0;

  constructor(mundo: Mundo, jogador: Jogador, interiores: Interiores, fim: FimDeJogo) {
    this.mundo = mundo;
    this.jogador = jogador;
    this.fim = fim;
    const { relogio, suspeita, avisos, cena, mapa, inventario } = mundo;

    for (const lugar of ARMADILHAS) {
      if (!mapa.livre(lugar.coluna, lugar.linha)) continue;
      const { x, y } = mapa.centroDaCelula(lugar);
      const g = cena.add.graphics({ x, y }).setDepth(profundidadeNoMundo(y - 10)).setVisible(false);
      g.lineStyle(2, 0x9a9aa8, 1);
      g.strokeCircle(0, 4, 9);
      for (let a = 0; a < 6; a++) g.lineBetween(Math.cos(a) * 5, 4 + Math.sin(a) * 5, Math.cos(a) * 11, 4 + Math.sin(a) * 11);
      this.armadilhas.push({ ...lugar, armada: false, desenho: g });
    }

    relogio.ouvir('novo-dia', () => {
      for (const aviso of passarDiaDaSuspeita(suspeita)) avisos.mostrar(aviso);
    });
    relogio.ouvir('amanheceu', () => {
      for (const a of this.armadilhas) {
        a.armada = false;
        a.desenho.setVisible(false);
      }
      if (nivel(suspeita) >= 2) avisos.mostrar('No sermão da manhã, o padre fala dos perigos da noite. A igreja estava cheia.');
    });
    relogio.ouvir('anoiteceu', () => {
      if (nivel(suspeita) < 4) return;
      for (const a of this.armadilhas) {
        a.armada = true;
        a.desenho.setVisible(true);
      }
      avisos.mostrar('Orlando armou armadilhas pelos caminhos.');
    });

    // Doar na igreja acalma a vila
    interiores.definirUso('igreja', 'altar', {
      dica: () => `Altar · E: doar ${DOACAO_NA_IGREJA} moedas`,
      acao: () => {
        if (inventario.moedas < DOACAO_NA_IGREJA) {
          avisos.mostrar(`Você não tem ${DOACAO_NA_IGREJA} moedas.`);
          return;
        }
        inventario.moedas -= DOACAO_NA_IGREJA;
        avisos.mostrar('O padre agradece a doação. A vila comenta sua generosidade.');
        avisos.mostrar(somarSuspeita(suspeita, SUSPEITA.doacaoNaIgreja));
      },
    });
  }

  atualizar(deltaMs: number) {
    const { suspeita, vampiro, avisos, energia, controle } = this.mundo;
    for (const aviso of lerRegistro(suspeita, vampiro.registro)) avisos.mostrar(aviso);

    if (suspeita.linchado) {
      this.fim.mostrar(
        'Linchado',
        'Tochas na porta da fazenda. Orlando à frente, o padre atrás com a cruz. A vila decidiu que o mal de Vale Cinzento tinha nome: Tomás.',
      );
      return;
    }

    this.tempo += deltaMs;
    if (this.presoAte && this.tempo >= this.presoAte) {
      this.presoAte = 0;
      controle.liberar('armadilha');
    }
    const pes = this.jogador.celulaDosPes;
    for (const a of this.armadilhas) {
      if (!a.armada || a.coluna !== pes.coluna || a.linha !== pes.linha) continue;
      a.armada = false;
      a.desenho.setVisible(false);
      energia.atual = Math.max(0, energia.atual - ARMADILHA_ENERGIA);
      controle.ocupar('armadilha');
      this.presoAte = this.tempo + ARMADILHA_PRENDE_POR;
      avisos.mostrar('Uma armadilha de ferro prendeu sua perna!');
    }
  }
}
