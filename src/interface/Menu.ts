import Phaser from 'phaser';
import { CAMADA } from '../arte/Camadas';
import { ALTURA, LARGURA } from '../config';
import type { Controle } from '../util/Controle';

export interface OpcaoDeMenu {
  texto: string;
  detalhe?: string; // aparece embaixo quando a opção está selecionada
  ativa?: boolean; // falsa: aparece apagada e não pode ser escolhida
  aoEscolher: () => void | 'fechar';
}

const VISIVEIS = 9; // quantas opções aparecem de uma vez (o resto rola)
const LARGURA_PAINEL = 540;
const ALTURA_PAINEL = 400;
const ALTURA_LINHA = 26;

const COR = { normal: '#ffffff', selecionada: '#ffe066', apagada: '#7a7a7a' };

// Menu na tela (barraca, caixa de venda, bancada, casa...). Um só para o jogo todo:
// abrir um menu novo substitui o que estava aberto. W/S ou setas escolhem, E ou
// Enter confirmam, Esc ou Q fecham. As opções são geradas de novo a cada quadro,
// então quantidades e preços estão sempre atualizados.
export class Menu {
  private aberto = false;
  private titulo: () => string = () => '';
  private gerarOpcoes: () => OpcaoDeMenu[] = () => [];
  private opcoes: OpcaoDeMenu[] = [];
  private selecionada = 0;
  private primeiraVisivel = 0;

  private controle: Controle;
  private objetos: Phaser.GameObjects.GameObject[] = [];
  private textoTitulo: Phaser.GameObjects.Text;
  private linhas: Phaser.GameObjects.Text[] = [];
  private textoDetalhe: Phaser.GameObjects.Text;
  private setaCima: Phaser.GameObjects.Text;
  private setaBaixo: Phaser.GameObjects.Text;
  private teclas: Record<'cima' | 'baixo' | 'escolher' | 'fechar', Phaser.Input.Keyboard.Key[]>;

  constructor(scene: Phaser.Scene, controle: Controle) {
    this.controle = controle;
    const esquerda = (LARGURA - LARGURA_PAINEL) / 2;
    const topo = (ALTURA - ALTURA_PAINEL) / 2;
    const fixo = <T extends Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth>(o: T) =>
      o.setScrollFactor(0).setDepth(CAMADA.janela);
    const texto = (x: number, y: number, tamanho = 16) =>
      fixo(scene.add.text(x, y, '', { fontFamily: 'monospace', fontSize: `${tamanho}px`, color: COR.normal }));

    const painel = fixo(
      scene.add
        .rectangle(LARGURA / 2, ALTURA / 2, LARGURA_PAINEL, ALTURA_PAINEL, 0x16121e, 0.95)
        .setStrokeStyle(2, 0x8a7a5a),
    );
    this.textoTitulo = texto(esquerda + 20, topo + 16, 18);
    for (let i = 0; i < VISIVEIS; i++) this.linhas.push(texto(esquerda + 24, topo + 56 + i * ALTURA_LINHA));
    this.setaCima = texto(LARGURA / 2, topo + 40, 12).setOrigin(0.5, 0).setText('▲');
    this.setaBaixo = texto(LARGURA / 2, topo + 56 + VISIVEIS * ALTURA_LINHA - 4, 12).setOrigin(0.5, 0).setText('▼');
    this.textoDetalhe = texto(esquerda + 20, topo + ALTURA_PAINEL - 92, 14)
      .setColor('#c8c0b0')
      .setWordWrapWidth(LARGURA_PAINEL - 40);
    const rodape = texto(esquerda + 20, topo + ALTURA_PAINEL - 26, 12)
      .setColor('#8a8a8a')
      .setText('W/S: escolher   E: confirmar   Esc ou Q: fechar');

    this.objetos = [painel, this.textoTitulo, ...this.linhas, this.setaCima, this.setaBaixo, this.textoDetalhe, rodape];
    for (const o of this.objetos) (o as Phaser.GameObjects.Text).setVisible(false);

    const teclado = scene.input.keyboard!;
    const teclas = (...nomes: string[]) => nomes.map((n) => teclado.addKey(n));
    this.teclas = {
      cima: teclas('W', 'UP'),
      baixo: teclas('S', 'DOWN'),
      escolher: teclas('E', 'ENTER', 'SPACE'),
      fechar: teclas('ESC', 'Q'),
    };
  }

  get estaAberto(): boolean {
    return this.aberto;
  }

  abrir(titulo: string | (() => string), opcoes: () => OpcaoDeMenu[]) {
    this.titulo = typeof titulo === 'string' ? () => titulo : titulo;
    this.gerarOpcoes = opcoes;
    this.selecionada = 0;
    this.primeiraVisivel = 0;
    if (!this.aberto) {
      this.aberto = true;
      this.controle.ocupar('menu');
      for (const o of this.objetos) (o as Phaser.GameObjects.Text).setVisible(true);
    }
    this.redesenhar();
  }

  fechar() {
    if (!this.aberto) return;
    this.aberto = false;
    this.controle.liberar('menu');
    for (const o of this.objetos) (o as Phaser.GameObjects.Text).setVisible(false);
  }

  atualizar() {
    if (!this.aberto) return;
    const apertou = (lista: Phaser.Input.Keyboard.Key[]) =>
      lista.map((t) => Phaser.Input.Keyboard.JustDown(t)).some(Boolean);

    if (apertou(this.teclas.fechar)) {
      this.fechar();
      return;
    }
    const total = this.opcoes.length;
    if (total > 0 && apertou(this.teclas.cima)) this.selecionada = (this.selecionada - 1 + total) % total;
    if (total > 0 && apertou(this.teclas.baixo)) this.selecionada = (this.selecionada + 1) % total;
    if (apertou(this.teclas.escolher)) {
      const opcao = this.opcoes[this.selecionada];
      if (opcao && opcao.ativa !== false && opcao.aoEscolher() === 'fechar') {
        this.fechar();
        return;
      }
    }
    if (this.aberto) this.redesenhar();
  }

  private redesenhar() {
    this.opcoes = this.gerarOpcoes();
    this.selecionada = Math.min(this.selecionada, Math.max(0, this.opcoes.length - 1));
    if (this.selecionada < this.primeiraVisivel) this.primeiraVisivel = this.selecionada;
    if (this.selecionada >= this.primeiraVisivel + VISIVEIS) this.primeiraVisivel = this.selecionada - VISIVEIS + 1;

    this.textoTitulo.setText(this.titulo());
    this.linhas.forEach((linha, i) => {
      const indice = this.primeiraVisivel + i;
      const opcao = this.opcoes[indice];
      if (!opcao) {
        linha.setText('');
        return;
      }
      const selecionada = indice === this.selecionada;
      linha.setText(`${selecionada ? '▸ ' : '  '}${opcao.texto}`);
      linha.setColor(opcao.ativa === false ? COR.apagada : selecionada ? COR.selecionada : COR.normal);
    });
    this.setaCima.setVisible(this.primeiraVisivel > 0);
    this.setaBaixo.setVisible(this.primeiraVisivel + VISIVEIS < this.opcoes.length);
    this.textoDetalhe.setText(this.opcoes[this.selecionada]?.detalhe ?? '');
  }
}
