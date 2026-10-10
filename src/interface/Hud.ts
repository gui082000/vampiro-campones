import type Phaser from 'phaser';
import { CAMADA } from '../arte/Camadas';
import { ALTURA, CAPACIDADE_REGADOR, LARGURA, TAMANHO_BARRA } from '../config';
import { definicaoDoItem } from '../dados/itens';
import { textoDaData } from '../estado/Calendario';
import type { Energia } from '../estado/Energia';
import type { Inventario } from '../estado/Inventario';
import type { Interacao } from '../sistemas/Interacao';
import type { Relogio } from '../sistemas/Relogio';
import { sinalVisivel, type Vampiro } from '../estado/Vampiro';
import { faixa, type Suspeita } from '../estado/Suspeita';
import { CaixaDeItem } from './CaixaDeItem';

const ESTILO_TEXTO: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'monospace',
  fontSize: '16px',
  color: '#ffffff',
  backgroundColor: '#000000aa',
  padding: { x: 8, y: 4 },
};

const COR_DIA = '#ffffff';
const COR_NOITE = '#ff6b6b';
const LARGURA_BARRA_ENERGIA = 150;
const ESPACO_BARRA = 48; // distância entre os quadradinhos da barra de atalhos

// Tudo o que fica fixo na tela: data e hora, moedas, energia, barra de atalhos
// (teclas 1 a 8), o nome do item na mão e a dica do que está na frente do Tomás.
// Só lê o estado do jogo; não muda nada.
export class Hud {
  private relogio: Relogio;
  private inventario: Inventario;
  private energia: Energia;
  private interacao: Interacao;

  private textoData: Phaser.GameObjects.Text;
  private textoHora: Phaser.GameObjects.Text;
  private textoMoedas: Phaser.GameObjects.Text;
  private barraEnergia: Phaser.GameObjects.Rectangle;
  private textoEnergia: Phaser.GameObjects.Text;
  private caixas: CaixaDeItem[] = [];
  private textoItem: Phaser.GameObjects.Text;
  private textoDica: Phaser.GameObjects.Text;
  private assinaturaDaBarra = '';

  private vampiro: Vampiro;
  private suspeita: Suspeita;
  private barraSuspeita!: Phaser.GameObjects.Rectangle;
  private textoSuspeita!: Phaser.GameObjects.Text;
  private barraFome!: Phaser.GameObjects.Rectangle;
  private textoFome!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, relogio: Relogio, inventario: Inventario, energia: Energia, interacao: Interacao, vampiro: Vampiro, suspeita: Suspeita) {
    this.vampiro = vampiro;
    this.suspeita = suspeita;
    this.relogio = relogio;
    this.inventario = inventario;
    this.energia = energia;
    this.interacao = interacao;

    const fixo = <T extends Phaser.GameObjects.Components.ScrollFactor & Phaser.GameObjects.Components.Depth>(o: T) =>
      o.setScrollFactor(0).setDepth(CAMADA.hud);
    const texto = (x: number, y: number, estilo = ESTILO_TEXTO) => fixo(scene.add.text(x, y, '', estilo));

    this.textoData = texto(12, 12);
    this.textoHora = texto(12, 44);
    this.textoMoedas = texto(12, 76);

    // Energia: fundo, barra que diminui e o número
    fixo(scene.add.rectangle(12, 116, LARGURA_BARRA_ENERGIA + 4, 16, 0x000000, 0.65).setOrigin(0, 0.5));
    this.barraEnergia = fixo(scene.add.rectangle(14, 116, LARGURA_BARRA_ENERGIA, 12, 0x5ac85a).setOrigin(0, 0.5));
    this.textoEnergia = texto(LARGURA_BARRA_ENERGIA + 22, 107, { ...ESTILO_TEXTO, fontSize: '13px', padding: { x: 4, y: 1 } });

    // Fome: barra vermelha que enche, o sinal visível e a essência
    fixo(scene.add.rectangle(12, 138, LARGURA_BARRA_ENERGIA + 4, 16, 0x000000, 0.65).setOrigin(0, 0.5));
    this.barraFome = fixo(scene.add.rectangle(14, 138, 0, 12, 0xb02030).setOrigin(0, 0.5));
    this.textoFome = texto(LARGURA_BARRA_ENERGIA + 22, 129, { ...ESTILO_TEXTO, fontSize: '13px', padding: { x: 4, y: 1 } });

    // Suspeita da vila: barra roxa e o nome da faixa
    fixo(scene.add.rectangle(12, 160, LARGURA_BARRA_ENERGIA + 4, 16, 0x000000, 0.65).setOrigin(0, 0.5));
    this.barraSuspeita = fixo(scene.add.rectangle(14, 160, 0, 12, 0x8a4ac0).setOrigin(0, 0.5));
    this.textoSuspeita = texto(LARGURA_BARRA_ENERGIA + 22, 151, { ...ESTILO_TEXTO, fontSize: '13px', padding: { x: 4, y: 1 } });

    const inicioBarra = LARGURA / 2 - ((TAMANHO_BARRA - 1) * ESPACO_BARRA) / 2;
    for (let i = 0; i < TAMANHO_BARRA; i++) {
      const x = inicioBarra + i * ESPACO_BARRA;
      this.caixas.push(new CaixaDeItem(scene, x, ALTURA - 30, 44, CAMADA.hud));
      fixo(
        scene.add
          .text(x - 19, ALTURA - 51, String(i + 1), { fontFamily: 'monospace', fontSize: '10px', color: '#bbbbbb' })
          .setStroke('#000000', 2),
      );
    }
    this.textoItem = texto(LARGURA / 2, ALTURA - 72, { ...ESTILO_TEXTO, fontSize: '14px' }).setOrigin(0.5, 1);
    this.textoDica = texto(LARGURA / 2, ALTURA - 104, ESTILO_TEXTO).setOrigin(0.5, 1);
    texto(12, ALTURA - 50, { fontFamily: 'monospace', fontSize: '11px', color: '#dddddd', backgroundColor: '#00000088', padding: { x: 5, y: 3 } })
      .setText('E: usar   F: comer\nI: inventário   J: diário');

    // A cor da hora acompanha a vida do Tomás: branco de dia, vermelho à noite
    this.textoHora.setColor(relogio.eNoite ? COR_NOITE : COR_DIA);
    relogio.ouvir('anoiteceu', () => this.textoHora.setColor(COR_NOITE));
    relogio.ouvir('amanheceu', () => this.textoHora.setColor(COR_DIA));
  }

  atualizar() {
    const { dia, horario, eNoite } = this.relogio;
    this.textoData.setText(`Dia ${dia} · ${textoDaData(dia)}`);
    this.textoHora.setText(`${horario} · ${eNoite ? 'Vampiro' : 'Camponês'}`);
    this.textoMoedas.setText(`Moedas: ${this.inventario.moedas}`);

    const fracao = this.energia.atual / this.energia.maxima;
    this.barraEnergia.setSize(Math.max(0, LARGURA_BARRA_ENERGIA * fracao), 12);
    this.barraEnergia.setFillStyle(fracao > 0.5 ? 0x5ac85a : fracao > 0.2 ? 0xe0c040 : 0xd04040);
    this.textoEnergia.setText(`Energia ${this.energia.atual}`);

    const { fome, essencia } = this.vampiro;
    this.barraFome.setSize(LARGURA_BARRA_ENERGIA * (fome / 100), 12);
    const sinal = sinalVisivel(this.vampiro, dia);
    this.textoFome.setText(`Fome ${Math.round(fome)}${sinal ? ` · ${sinal}` : ''}${essencia ? ` · essência ${essencia}` : ''}`);
    this.textoFome.setColor(sinal ? '#ff8080' : '#ffffff');

    this.barraSuspeita.setSize(LARGURA_BARRA_ENERGIA * (this.suspeita.valor / 100), 12);
    this.textoSuspeita.setText(`Suspeita: ${faixa(this.suspeita).nome}${this.suspeita.carregando ? ' · carregando um corpo' : ''}`);

    this.atualizarBarra();

    const pilha = this.inventario.pilhaNaMao;
    const nome = pilha ? definicaoDoItem(pilha.item).nome : '';
    const agua = pilha?.item === 'regador' ? ` (${this.inventario.aguaNoRegador}/${CAPACIDADE_REGADOR})` : '';
    this.textoItem.setText(`${nome}${agua}`).setVisible(nome !== '');
    this.textoDica.setText(this.interacao.dica).setVisible(this.interacao.dica !== '');
  }

  // Só redesenha a barra de atalhos quando algo nela muda
  private atualizarBarra() {
    const slots = this.inventario.slots.slice(0, TAMANHO_BARRA);
    const assinatura = `${this.inventario.selecionado}|${this.inventario.aguaNoRegador}|${slots
      .map((s) => (s ? `${s.item}:${s.qtd}` : '-'))
      .join(',')}`;
    if (assinatura === this.assinaturaDaBarra) return;
    this.assinaturaDaBarra = assinatura;

    slots.forEach((pilha, i) => {
      const agua = pilha?.item === 'regador' ? this.inventario.aguaNoRegador / CAPACIDADE_REGADOR : undefined;
      this.caixas[i].mostrar(pilha, agua);
      this.caixas[i].destacar(i === this.inventario.selecionado ? 'selecionado' : 'normal');
    });
  }
}
