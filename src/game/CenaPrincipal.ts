import Phaser from 'phaser';
import { ALTURA, ALTURA_MUNDO, LARGURA, LARGURA_MUNDO } from './config';
import { Relogio } from './Relogio';
import { Inventario } from './Inventario';
import { Fazenda } from './Fazenda';
import { criarBarracaDeSementes, criarCaixaDeVenda } from './Estacao';
import { Jogador } from './Jogador';
import { GerenciadorInteracao } from './GerenciadorInteracao';
import { SeletorFerramenta } from './SeletorFerramenta';
import { Vila } from './Vila';
import { criarDecoracoes } from './Decoracoes';
import { TILE } from './Tileset';
import tilesetUrl from '../assets/tileset.png';

const ESTILO_TEXTO: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'monospace',
  fontSize: '18px',
  color: '#ffffff',
  backgroundColor: '#000000aa',
  padding: { x: 8, y: 4 },
};

// Monta a cena a partir das peças (relógio, fazenda, estações, jogador) e liga a
// atualização de cada uma por quadro. Cada mecânica nova deve ganhar sua própria
// classe/arquivo em src/game e ser conectada aqui.
export class CenaPrincipal extends Phaser.Scene {
  private jogador!: Jogador;
  private relogio!: Relogio;
  private inventario!: Inventario;
  private fazenda!: Fazenda;
  private interacao!: GerenciadorInteracao;
  private seletorFerramenta!: SeletorFerramenta;
  private vila!: Vila;

  constructor() {
    super('CenaPrincipal');
  }

  preload() {
    this.load.spritesheet('tiles', tilesetUrl, { frameWidth: TILE, frameHeight: TILE });
  }

  create() {
    this.add.grid(
      LARGURA_MUNDO / 2,
      ALTURA_MUNDO / 2,
      LARGURA_MUNDO,
      ALTURA_MUNDO,
      32,
      32,
      0x2d5a27,
      1,
      0x234a1f,
      1,
    );

    this.physics.world.setBounds(0, 0, LARGURA_MUNDO, ALTURA_MUNDO);
    this.cameras.main.setBounds(0, 0, LARGURA_MUNDO, ALTURA_MUNDO);

    this.inventario = new Inventario(this, ESTILO_TEXTO);

    // Fazenda fica perto do início do mapa (oeste)
    const centroFazendaX = 450;
    this.fazenda = new Fazenda(this, this.inventario, centroFazendaX, 440);

    const barraca = criarBarracaDeSementes(this, this.inventario, centroFazendaX - 280, 140);
    const caixaDeVenda = criarCaixaDeVenda(this, this.inventario, centroFazendaX + 280, 140);

    // Cidade vizinha fica mais a leste, exigindo caminhar até lá
    this.vila = new Vila(this, LARGURA_MUNDO - 500, ALTURA_MUNDO / 2);

    criarDecoracoes(this, LARGURA_MUNDO, ALTURA_MUNDO);

    this.jogador = new Jogador(this, centroFazendaX, ALTURA / 2);
    this.cameras.main.startFollow(this.jogador.sprite, true);

    this.seletorFerramenta = new SeletorFerramenta(this, this.inventario);

    this.interacao = new GerenciadorInteracao(this, ESTILO_TEXTO);
    this.interacao.registrar(...this.fazenda.obterInteragiveis(), barraca, caixaDeVenda);

    this.relogio = new Relogio(this, LARGURA, ALTURA, ESTILO_TEXTO, () => this.fazenda.novoDia());
  }

  update(tempo: number, delta: number) {
    this.jogador.atualizar();
    const deltaHoras = this.relogio.atualizar(delta);
    this.fazenda.atualizar(deltaHoras);
    this.vila.atualizar(tempo);
    this.seletorFerramenta.atualizar();
    this.interacao.atualizar(this.jogador);
  }
}
