import Phaser from 'phaser';
import { CAMADA } from '../arte/Camadas';
import { ALTURA, CAPACIDADE_REGADOR, LARGURA, TAMANHO_BARRA } from '../config';
import { definicaoDoItem } from '../dados/itens';
import type { Inventario } from '../estado/Inventario';
import type { Recipiente } from '../estado/Recipiente';
import type { Controle } from '../util/Controle';
import { CaixaDeItem } from './CaixaDeItem';
import { textoDoItem } from './textos';

const COLUNAS = TAMANHO_BARRA; // 8 por fileira
const CELULA = 48;
const LARGURA_PAINEL = 460;

interface Grade {
  recipiente: Recipiente | null;
  caixas: CaixaDeItem[];
  titulo: Phaser.GameObjects.Text;
}

// Tela do inventário (tecla I). Sozinha, serve para arrumar os itens: E num espaço
// pega o item e E em outro troca os dois de lugar (a primeira fileira é a barra de
// atalhos). Aberta pelo depósito, mostra o baú em cima e o inventário embaixo, e E
// passa a pilha inteira para o outro lado.
export class TelaDoInventario {
  private aberta = false;
  private controle: Controle;
  private inventario: Inventario;
  private grades: [Grade, Grade]; // [depósito, inventário]
  private emDeposito = false;
  private cursor = { grade: 1, indice: 0 };
  private pego: number | null = null; // espaço pego para trocar (só sem o depósito)

  private painel: Phaser.GameObjects.Rectangle;
  private textoInfo: Phaser.GameObjects.Text;
  private rodape: Phaser.GameObjects.Text;
  private teclas: Record<'cima' | 'baixo' | 'esquerda' | 'direita' | 'usar' | 'trocarGrade' | 'fechar' | 'abrir', Phaser.Input.Keyboard.Key[]>;

  constructor(scene: Phaser.Scene, controle: Controle, inventario: Inventario) {
    this.controle = controle;
    this.inventario = inventario;
    const fixo = <T extends Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth>(o: T) =>
      o.setScrollFactor(0).setDepth(CAMADA.janela);

    this.painel = fixo(
      scene.add.rectangle(LARGURA / 2, ALTURA / 2, LARGURA_PAINEL, 300, 0x16121e, 0.95).setStrokeStyle(2, 0x8a7a5a),
    );
    const novaGrade = (tamanho: number): Grade => ({
      recipiente: null,
      caixas: Array.from({ length: tamanho }, () => new CaixaDeItem(scene, 0, 0, 44, CAMADA.janela + 1)),
      titulo: fixo(scene.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' })),
    });
    this.grades = [novaGrade(24), novaGrade(inventario.slots.length)];
    this.textoInfo = fixo(
      scene.add
        .text(0, 0, '', { fontFamily: 'monospace', fontSize: '13px', color: '#c8c0b0' })
        .setWordWrapWidth(LARGURA_PAINEL - 40),
    );
    this.rodape = fixo(scene.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '12px', color: '#8a8a8a' }));
    this.mostrarTudo(false);

    const teclado = scene.input.keyboard!;
    const teclas = (...nomes: string[]) => nomes.map((n) => teclado.addKey(n));
    this.teclas = {
      cima: teclas('W', 'UP'),
      baixo: teclas('S', 'DOWN'),
      esquerda: teclas('A', 'LEFT'),
      direita: teclas('D', 'RIGHT'),
      usar: teclas('E', 'ENTER', 'SPACE'),
      trocarGrade: teclas('TAB'),
      fechar: teclas('ESC', 'Q'),
      abrir: teclas('I'),
    };
  }

  get estaAberta(): boolean {
    return this.aberta;
  }

  abrir(deposito?: Recipiente) {
    this.aberta = true;
    this.controle.ocupar('inventario');
    this.emDeposito = !!deposito;
    this.grades[0].recipiente = deposito ?? null;
    this.grades[1].recipiente = this.inventario;
    this.cursor = { grade: 1, indice: this.inventario.selecionado };
    this.pego = null;
    this.posicionar();
    this.mostrarTudo(true);
    this.redesenhar();
  }

  fechar() {
    this.aberta = false;
    this.pego = null;
    this.controle.liberar('inventario');
    this.mostrarTudo(false);
  }

  atualizar() {
    const apertou = (lista: Phaser.Input.Keyboard.Key[]) =>
      lista.map((t) => Phaser.Input.Keyboard.JustDown(t)).some(Boolean);

    const apertouI = apertou(this.teclas.abrir); // lido sempre, para não "sobrar" para depois
    if (!this.aberta) {
      if (apertouI && this.controle.livre) this.abrir();
      return;
    }
    if (apertou(this.teclas.fechar) || apertouI) {
      this.fechar();
      return;
    }

    const tamanho = this.grades[this.cursor.grade].caixas.length;
    if (apertou(this.teclas.esquerda)) this.cursor.indice = (this.cursor.indice - 1 + tamanho) % tamanho;
    if (apertou(this.teclas.direita)) this.cursor.indice = (this.cursor.indice + 1) % tamanho;
    if (apertou(this.teclas.cima)) this.moverNaVertical(-1);
    if (apertou(this.teclas.baixo)) this.moverNaVertical(1);
    if (this.emDeposito && apertou(this.teclas.trocarGrade)) this.cursor.grade = 1 - this.cursor.grade;
    if (apertou(this.teclas.usar)) this.usar();

    this.redesenhar();
  }

  private moverNaVertical(sentido: number) {
    const tamanho = this.grades[this.cursor.grade].caixas.length;
    const destino = this.cursor.indice + sentido * COLUNAS;
    if (destino >= 0 && destino < tamanho) {
      this.cursor.indice = destino;
      return;
    }
    if (!this.emDeposito) return;
    // Passa de uma grade para a outra pela borda
    const outra = 1 - this.cursor.grade;
    const coluna = this.cursor.indice % COLUNAS;
    const tamanhoOutra = this.grades[outra].caixas.length;
    if (sentido < 0 && outra === 0) this.cursor = { grade: 0, indice: tamanhoOutra - COLUNAS + coluna };
    if (sentido > 0 && outra === 1) this.cursor = { grade: 1, indice: coluna };
  }

  private usar() {
    const { grade, indice } = this.cursor;
    if (this.emDeposito) {
      const origem = this.grades[grade].recipiente!;
      const destino = this.grades[1 - grade].recipiente!;
      origem.moverPara(indice, destino);
      return;
    }
    if (this.pego === null) {
      if (this.inventario.slots[indice]) this.pego = indice;
      return;
    }
    if (this.pego !== indice) this.inventario.trocar(this.pego, indice);
    this.pego = null;
  }

  private posicionar() {
    const linhasDeposito = this.emDeposito ? 3 : 0;
    const alturaGrades = (linhasDeposito + 3) * CELULA + (this.emDeposito ? 2 : 1) * 30;
    const alturaPainel = alturaGrades + 150;
    const topo = ALTURA / 2 - alturaPainel / 2;
    const esquerda = LARGURA / 2 - (COLUNAS * CELULA) / 2 + CELULA / 2;
    this.painel.setSize(LARGURA_PAINEL, alturaPainel).setPosition(LARGURA / 2, ALTURA / 2);

    let y = topo + 16;
    for (const g of this.emDeposito ? this.grades : [this.grades[1]]) {
      g.titulo.setPosition(LARGURA / 2 - (COLUNAS * CELULA) / 2, y);
      y += 30;
      g.caixas.forEach((caixa, i) => {
        const cx = esquerda + (i % COLUNAS) * CELULA;
        const cy = y + CELULA / 2 + Math.floor(i / COLUNAS) * CELULA;
        caixa.mover(cx, cy);
      });
      y += Math.ceil(g.caixas.length / COLUNAS) * CELULA;
    }
    this.textoInfo.setPosition(LARGURA / 2 - LARGURA_PAINEL / 2 + 20, y + 10);
    this.rodape.setPosition(LARGURA / 2 - LARGURA_PAINEL / 2 + 20, topo + alturaPainel - 26);
  }

  private redesenhar() {
    this.grades[0].titulo.setText('Depósito');
    this.grades[1].titulo.setText(`Inventário   ·   ${this.inventario.moedas} moedas`);
    this.grades.forEach((g, numero) => {
      if (!g.recipiente) return;
      g.caixas.forEach((caixa, i) => {
        const pilha = g.recipiente!.slots[i];
        const agua = pilha?.item === 'regador' ? this.inventario.aguaNoRegador / CAPACIDADE_REGADOR : undefined;
        caixa.mostrar(pilha, agua);
        const noCursor = this.cursor.grade === numero && this.cursor.indice === i;
        const pego = !this.emDeposito && numero === 1 && this.pego === i;
        caixa.destacar(pego ? 'pego' : noCursor ? 'selecionado' : 'normal');
      });
    });

    const pilha = this.grades[this.cursor.grade].recipiente?.slots[this.cursor.indice];
    this.textoInfo.setText(
      pilha ? `${definicaoDoItem(pilha.item).nome}${pilha.qtd > 1 ? ` (${pilha.qtd})` : ''}\n${textoDoItem(pilha.item)}` : '',
    );
    this.rodape.setText(
      this.emDeposito
        ? 'Setas: mover   E: passar para o outro lado   Tab: trocar   Esc: fechar'
        : this.pego === null
          ? 'Setas: mover   E: pegar   Esc ou I: fechar   (1ª fileira = barra 1 a 8)'
          : 'E: trocar de lugar (no mesmo espaço: cancela)',
    );
  }

  private mostrarTudo(visivel: boolean) {
    this.painel.setVisible(visivel);
    this.textoInfo.setVisible(visivel);
    this.rodape.setVisible(visivel);
    this.grades.forEach((g, numero) => {
      const ativa = visivel && (numero === 1 || this.emDeposito);
      g.titulo.setVisible(ativa);
      for (const caixa of g.caixas) caixa.setVisible(ativa);
    });
  }
}
