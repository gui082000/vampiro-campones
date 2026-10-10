import Phaser from 'phaser';
import { CAMADA } from '../arte/Camadas';
import { ALTURA, LARGURA } from '../config';
import { ALDEOES, type IdAldeao } from '../dados/aldeoes';
import { MISSOES } from '../dados/missoes';
import type { Diario } from '../estado/Diario';
import { textoDoPedido, type Missoes } from '../estado/Missoes';
import type { Relacoes } from '../estado/Relacoes';
import type { Controle } from '../util/Controle';

const ABAS = ['Missões', 'Aldeões', 'Pistas', 'Finais'] as const;

// O diário do Tomás (tecla J): missões, amizade com cada aldeão, pistas descobertas e
// finais encontrados. A e D (ou setas) trocam de aba; Esc ou J fecham.
export class TelaDoDiario {
  private aberta = false;
  private aba = 0;
  private controle: Controle;
  private diario: Diario;
  private missoes: Missoes;
  private relacoes: Relacoes;
  private objetos: Phaser.GameObjects.GameObject[];
  private titulo: Phaser.GameObjects.Text;
  private corpo: Phaser.GameObjects.Text;
  private teclas: Record<'abrir' | 'fechar' | 'esquerda' | 'direita', Phaser.Input.Keyboard.Key[]>;

  constructor(scene: Phaser.Scene, controle: Controle, diario: Diario, missoes: Missoes, relacoes: Relacoes) {
    this.controle = controle;
    this.diario = diario;
    this.missoes = missoes;
    this.relacoes = relacoes;
    const fixo = <T extends Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth>(o: T) =>
      o.setScrollFactor(0).setDepth(CAMADA.janela);
    const painel = fixo(scene.add.rectangle(LARGURA / 2, ALTURA / 2 - 20, 640, 470, 0x1e1810, 0.96).setStrokeStyle(2, 0x8a7a5a));
    this.titulo = fixo(scene.add.text(100, 70, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffe066' }));
    this.corpo = fixo(
      scene.add
        .text(100, 110, '', { fontFamily: 'monospace', fontSize: '13px', color: '#e8dcc0', lineSpacing: 5 })
        .setWordWrapWidth(600),
    );
    const rodape = fixo(
      scene.add.text(100, ALTURA / 2 + 190, 'A/D: trocar de aba   Esc ou J: fechar', { fontFamily: 'monospace', fontSize: '12px', color: '#8a8a8a' }),
    );
    this.objetos = [painel, this.titulo, this.corpo, rodape];
    this.mostrar(false);
    const teclado = scene.input.keyboard!;
    const teclas = (...nomes: string[]) => nomes.map((n) => teclado.addKey(n));
    this.teclas = { abrir: teclas('J'), fechar: teclas('ESC', 'Q'), esquerda: teclas('A', 'LEFT'), direita: teclas('D', 'RIGHT') };
  }

  get estaAberta(): boolean {
    return this.aberta;
  }

  atualizar() {
    const apertou = (lista: Phaser.Input.Keyboard.Key[]) => lista.map((t) => Phaser.Input.Keyboard.JustDown(t)).some(Boolean);
    const apertouJ = apertou(this.teclas.abrir);
    if (!this.aberta) {
      if (apertouJ && this.controle.livre) {
        this.aberta = true;
        this.controle.ocupar('diario');
        this.mostrar(true);
        this.redesenhar();
      }
      return;
    }
    if (apertouJ || apertou(this.teclas.fechar)) {
      this.aberta = false;
      this.controle.liberar('diario');
      this.mostrar(false);
      return;
    }
    if (apertou(this.teclas.esquerda)) this.aba = (this.aba + ABAS.length - 1) % ABAS.length;
    if (apertou(this.teclas.direita)) this.aba = (this.aba + 1) % ABAS.length;
    this.redesenhar();
  }

  private redesenhar() {
    this.titulo.setText(ABAS.map((a, i) => (i === this.aba ? `[${a}]` : ` ${a} `)).join('  '));
    this.corpo.setText(this.textoDaAba());
  }

  private textoDaAba(): string {
    switch (ABAS[this.aba]) {
      case 'Missões': {
        const ativas = this.missoes.ativas().map((id) => `• ${MISSOES[id].titulo} — ${ALDEOES[MISSOES[id].aldeao].nome}: levar ${textoDoPedido(id)}`);
        const feitas = this.missoes.concluidas().map((id) => `✓ ${MISSOES[id].titulo}`);
        if (!ativas.length && !feitas.length) return 'Nenhuma missão ainda. Converse com os aldeões.';
        return [...(ativas.length ? ['Em andamento:', ...ativas, ''] : []), ...(feitas.length ? ['Concluídas:', ...feitas] : [])].join('\n');
      }
      case 'Aldeões':
        return (Object.keys(ALDEOES) as IdAldeao[])
          .map((id) => {
            const c = this.relacoes.coracoes(id);
            return `${ALDEOES[id].nome.padEnd(15)} ${'♥'.repeat(c)}${'·'.repeat(10 - c)}  ${ALDEOES[id].quem}`;
          })
          .join('\n');
      case 'Pistas':
        return this.diario.pistas.length ? this.diario.pistas.map((p) => `• ${p}`).join('\n') : 'Nada descoberto ainda. Leia lápides, livros... e ouça a vila.';
      default:
        return this.diario.finais.length ? this.diario.finais.join('\n') : 'Nenhum final descoberto. (Fase 7)';
    }
  }

  private mostrar(visivel: boolean) {
    for (const o of this.objetos) (o as Phaser.GameObjects.Text).setVisible(visivel);
  }
}
