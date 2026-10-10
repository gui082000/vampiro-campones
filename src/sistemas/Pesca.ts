import Phaser from 'phaser';
import { CAMADA } from '../arte/Camadas';
import {
  CAPACIDADE_REGADOR,
  CUSTO_DE_ENERGIA,
  PESCA_ESPERA_MAXIMA,
  PESCA_ESPERA_MINIMA,
  PESCA_TEMPO_PARA_FISGAR,
} from '../config';
import { nomeDoItem } from '../dados/itens';
import { sortearPeixe } from '../estado/Pesca';
import { SEM_ENERGIA } from '../estado/Resultado';
import type { UsoDaConstrucao } from './Construcao';
import type { Interagivel } from './Interacao';
import { TAMANHO_CELULA } from './Mapa';
import type { Mundo } from './Mundo';

// Água: com o regador na mão, E enche o regador; com a vara de pesca, E joga a linha.
// Depois de um tempo o peixe morde e aparece um "!" sobre o Tomás: é preciso apertar E
// rápido para fisgar. Enquanto pesca, ele não anda (E de novo desiste).
export class Pesca {
  private mundo: Mundo;
  private estado: 'parada' | 'esperando' | 'fisgou' = 'parada';
  private tempo = 0; // ms até a próxima etapa
  private boia: Phaser.GameObjects.Arc;
  private alerta: Phaser.GameObjects.Text;
  private teclaE: Phaser.Input.Keyboard.Key;

  constructor(mundo: Mundo) {
    this.mundo = mundo;
    this.teclaE = mundo.cena.input.keyboard!.addKey('E');
    this.boia = mundo.cena.add.circle(0, 0, 4, 0xe03030).setStrokeStyle(2, 0xffffff).setDepth(CAMADA.cursor).setVisible(false);
    this.alerta = mundo.cena.add
      .text(0, 0, '!', { fontFamily: 'monospace', fontSize: '28px', color: '#ffe066' })
      .setStroke('#000000', 4)
      .setOrigin(0.5)
      .setDepth(CAMADA.rotulos)
      .setVisible(false);
    mundo.interacao.registrarProvedor((coluna, linha) => this.alvoEm(coluna, linha));
  }

  private alvoEm(coluna: number, linha: number): Interagivel | null {
    if (!this.mundo.mapa.eAgua(coluna, linha)) return null;
    const { inventario, avisos } = this.mundo;
    const area = {
      x: coluna * TAMANHO_CELULA + TAMANHO_CELULA / 2,
      y: linha * TAMANHO_CELULA + TAMANHO_CELULA / 2,
      largura: TAMANHO_CELULA,
      altura: TAMANHO_CELULA,
    };
    if (inventario.itemNaMao === 'regador') {
      return {
        ...area,
        dica: () => (inventario.aguaNoRegador >= CAPACIDADE_REGADOR ? 'O regador está cheio' : 'E: encher o regador'),
        acao: () => avisos.mostrar(inventario.encherRegador().aviso),
      };
    }
    if (inventario.itemNaMao === 'varaDePesca') {
      return { ...area, dica: () => 'E: pescar', acao: () => this.lancar(area.x, area.y) };
    }
    return null;
  }

  // O poço (depois de construído) também enche o regador
  usoDoPoco(): UsoDaConstrucao {
    const { inventario, avisos } = this.mundo;
    return {
      dica: () => (inventario.itemNaMao === 'regador' ? 'Poço · E: encher o regador' : 'Poço · use o regador para pegar água'),
      acao: () => {
        if (inventario.itemNaMao === 'regador') avisos.mostrar(inventario.encherRegador().aviso);
      },
    };
  }

  private lancar(x: number, y: number) {
    if (!this.mundo.energia.gastar(CUSTO_DE_ENERGIA.pescar)) {
      this.mundo.avisos.mostrar(SEM_ENERGIA);
      return;
    }
    this.estado = 'esperando';
    this.tempo = Phaser.Math.FloatBetween(PESCA_ESPERA_MINIMA, PESCA_ESPERA_MAXIMA) * 1000;
    this.boia.setPosition(x, y).setVisible(true);
    this.mundo.controle.ocupar('pesca');
    this.mundo.avisos.mostrar('Esperando o peixe morder... (E: desistir)');
  }

  // jogador: para pôr o "!" sobre a cabeça dele
  atualizar(deltaMs: number, jogador: { x: number; y: number }) {
    if (this.estado === 'parada') return;
    const apertouE = Phaser.Input.Keyboard.JustDown(this.teclaE);
    this.tempo -= deltaMs;

    if (this.estado === 'esperando') {
      this.boia.setScale(1 + Math.sin(this.tempo / 150) * 0.15);
      if (apertouE) {
        this.terminar('Você recolheu a linha');
      } else if (this.tempo <= 0) {
        this.estado = 'fisgou';
        this.tempo = PESCA_TEMPO_PARA_FISGAR * 1000;
        this.alerta.setPosition(jogador.x, jogador.y - 46).setVisible(true);
      }
      return;
    }

    // Fisgou: precisa apertar E antes do tempo acabar
    if (apertouE) {
      const peixe = sortearPeixe(this.mundo.relogio.eNoite, Math.random);
      if (this.mundo.inventario.espacoPara(peixe) < 1) {
        this.terminar('Inventário cheio: o peixe escapou');
        return;
      }
      this.mundo.inventario.adicionar(peixe, 1);
      this.terminar(`Você pescou: ${nomeDoItem(peixe)}!`);
    } else if (this.tempo <= 0) {
      this.terminar('O peixe escapou...');
    }
  }

  private terminar(mensagem: string) {
    this.estado = 'parada';
    this.boia.setVisible(false);
    this.alerta.setVisible(false);
    this.mundo.controle.liberar('pesca');
    this.mundo.avisos.mostrar(mensagem);
  }
}
