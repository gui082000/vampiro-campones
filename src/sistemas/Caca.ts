import type Phaser from 'phaser';
import { profundidadeNoMundo } from '../arte/Camadas';
import { CHAVE_JOGADOR, ESCALA_JOGADOR, quadroParado } from '../arte/Personagem';
import { CHANCE_DE_VIAJANTE } from '../config';
import { ALDEOES } from '../dados/aldeoes';
import {
  ACAMPAMENTO_DO_VIAJANTE,
  ALIMENTOS,
  AREA_DOS_CERVOS,
  QUANTIDADE_DE_CERVOS,
  VIAJANTE_CHEGA,
  VIAJANTE_PARTE,
  VIAJANTES,
} from '../dados/vampiro';
import { beber } from '../estado/Vampiro';
import { atoDoDia } from '../estado/Historia';
import { TAMANHO_CELULA } from './Mapa';
import { registrarMordida, type Mundo } from './Mundo';

interface Cervo {
  grafico: Phaser.GameObjects.Graphics;
  vivo: boolean;
}

// Presas da noite fora da vila: cervos na floresta (seguro, alimenta pouco) e, em
// algumas noites, um viajante acampado na estrada perto do portão (alimenta bem; beber
// até o fim mata, e ninguém da vila conhece quem passa).
export class Caca {
  private mundo: Mundo;
  private cervos: Cervo[] = [];
  private viajante: Phaser.GameObjects.Sprite;
  private fogueira: Phaser.GameObjects.Arc;
  private quemViaja = '';
  private viajanteNaEstrada = false;

  constructor(mundo: Mundo) {
    this.mundo = mundo;
    const { cena, mapa, interacao, relogio } = mundo;

    for (let i = 0; i < QUANTIDADE_DE_CERVOS; i++) {
      const g = cena.add.graphics().setVisible(false);
      g.fillStyle(0x8a5a30, 1);
      g.fillEllipse(0, 0, 30, 16);
      g.fillEllipse(14, -10, 12, 10);
      g.lineStyle(2, 0x5a3a20, 1);
      g.lineBetween(14, -14, 10, -24);
      g.lineBetween(16, -14, 20, -24);
      g.fillStyle(0x5a3a20, 1);
      for (const x of [-10, -4, 6, 11]) g.fillRect(x, 6, 3, 9);
      const cervo: Cervo = { grafico: g, vivo: false };
      this.cervos.push(cervo);
      interacao.registrar({
        get x() {
          return g.x;
        },
        get y() {
          return g.y;
        },
        largura: 40,
        altura: 36,
        ativo: () => cervo.vivo,
        dica: () => 'Cervo · E: morder',
        acao: () => {
          cervo.vivo = false;
          g.setVisible(false);
          registrarMordida(mundo);
          mundo.avisos.mostrar(beber(mundo.vampiro, 'cervo', 'um cervo').aviso);
        },
      });
    }

    const acampamento = mapa.centroDaCelula(ACAMPAMENTO_DO_VIAJANTE);
    this.fogueira = cena.add.circle(acampamento.x + 34, acampamento.y + 10, 7, 0xe07020).setVisible(false);
    this.viajante = cena.add
      .sprite(acampamento.x, acampamento.y - 14, CHAVE_JOGADOR, quadroParado('baixo'))
      .setScale(ESCALA_JOGADOR)
      .setTint(0x9a9a9a)
      .setDepth(profundidadeNoMundo(acampamento.y + 14))
      .setVisible(false);
    interacao.registrar({
      x: acampamento.x,
      y: acampamento.y,
      largura: TAMANHO_CELULA,
      altura: TAMANHO_CELULA * 1.5,
      ativo: () => this.viajanteNaEstrada,
      dica: () => `Viajante acampado · E: aproximar-se`,
      acao: () => this.abrirViajante(),
    });

    relogio.ouvir('anoiteceu', () => this.soltarCervos());
    relogio.ouvir('amanheceu', () => {
      for (const c of this.cervos) {
        c.vivo = false;
        c.grafico.setVisible(false);
      }
    });
    relogio.ouvir('novo-dia', () => {
      // Sorteia de manhã se haverá viajante na próxima noite
      this.quemViaja = Math.random() < CHANCE_DE_VIAJANTE ? VIAJANTES[Math.floor(Math.random() * VIAJANTES.length)] : '';
    });
    this.quemViaja = VIAJANTES[0]; // a primeira noite sempre tem um, para o jogador conhecer
  }

  // Ligado pela cena: encerra o jogo com o final Fuga
  fugir: () => void = () => {};

  private soltarCervos() {
    const { mapa } = this.mundo;
    for (const c of this.cervos) {
      for (let tentativa = 0; tentativa < 40; tentativa++) {
        const coluna = AREA_DOS_CERVOS.coluna + Math.floor(Math.random() * AREA_DOS_CERVOS.colunas);
        const linha = AREA_DOS_CERVOS.linha + Math.floor(Math.random() * AREA_DOS_CERVOS.linhas);
        if (!mapa.livre(coluna, linha)) continue;
        const { x, y } = mapa.centroDaCelula({ coluna, linha });
        c.grafico.setPosition(x, y).setDepth(profundidadeNoMundo(y + 8)).setVisible(true);
        c.vivo = true;
        break;
      }
    }
  }

  private abrirViajante() {
    const { menu, vampiro, avisos } = this.mundo;
    const terminar = () => {
      this.viajanteNaEstrada = false;
      this.quemViaja = '';
      this.viajante.setVisible(false);
      this.fogueira.setVisible(false);
    };
    menu.abrir(() => {
      const vendo = this.mundo.testemunhas().map((id) => ALDEOES[id].nome);
      const cuidado = vendo.length ? `  Cuidado: ${vendo.join(', ')} pode ver!` : '';
      return `Na beira da estrada, ${this.quemViaja} dorme junto ao fogo.${cuidado}`;
    }, () => [
      {
        texto: 'Beber um pouco',
        detalhe: ALIMENTOS.viajantePouco.descricao + (vampiro.tem('hipnose') ? ' Com a hipnose, ele não vai lembrar.' : ' Sem hipnose, vai lembrar de você.'),
        aoEscolher: () => {
          registrarMordida(this.mundo);
          avisos.mostrar(beber(vampiro, 'viajantePouco', this.quemViaja).aviso);
          if (!vampiro.tem('hipnose')) vampiro.registro.push('testemunha:viajante');
          terminar();
          return 'fechar' as const;
        },
      },
      {
        texto: 'Beber até o fim',
        detalhe: ALIMENTOS.viajanteFim.descricao,
        aoEscolher: () => {
          registrarMordida(this.mundo);
          avisos.mostrar(beber(vampiro, 'viajanteFim', this.quemViaja).aviso);
          vampiro.registro.push('desaparecido:viajante');
          terminar();
          return 'fechar' as const;
        },
      },
      ...(atoDoDia(this.mundo.relogio.dia).numero >= 2
        ? [
            {
              texto: 'Acordá-lo e pedir para ir embora com ele, para sempre',
              detalhe: 'Final: Fuga. A fazenda, a vila e o segredo ficam para trás.',
              aoEscolher: () => {
                this.fugir();
                return 'fechar' as const;
              },
            },
          ]
        : []),
      { texto: 'Deixar em paz', aoEscolher: () => 'fechar' as const },
    ]);
  }

  // O viajante chega às 20h e vai embora às 4h
  atualizar() {
    const hora = this.mundo.relogio.hora;
    const horario = hora >= VIAJANTE_CHEGA || hora < VIAJANTE_PARTE;
    // Na tempestade ninguém acampa na estrada
    if (horario && this.quemViaja && !this.viajanteNaEstrada && this.mundo.clima.tempo !== 'tempestade') {
      this.viajanteNaEstrada = true;
      this.viajante.setVisible(true);
      this.fogueira.setVisible(true);
    }
    if (!horario && this.viajanteNaEstrada) {
      this.viajanteNaEstrada = false;
      this.viajante.setVisible(false);
      this.fogueira.setVisible(false);
      this.quemViaja = '';
    }
  }
}
