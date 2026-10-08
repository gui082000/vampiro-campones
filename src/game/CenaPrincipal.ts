import Phaser from 'phaser';
import { ALTURA, LARGURA } from './config';
import { Relogio } from './Relogio';
import { Inventario } from './Inventario';
import { Jogador } from './Jogador';
import { GerenciadorInteracao } from './GerenciadorInteracao';
import { SeletorFerramenta } from './SeletorFerramenta';
import { TILE } from './Tileset';
import { CHAVE_IMAGEM_MAPA, CHAVE_MAPA, imagemUrl, Mapa, mapaUrl } from './Mapa';
import tilesetUrl from '../assets/tileset.png';

const ESTILO_TEXTO: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: 'monospace',
  fontSize: '18px',
  color: '#ffffff',
  backgroundColor: '#000000aa',
  padding: { x: 8, y: 4 },
};

// Monta a cena a partir das peças (mapa, relógio, jogador) e liga a
// atualização de cada uma por quadro. Cada mecânica nova deve ganhar sua própria
// classe/arquivo em src/game e ser conectada aqui.
export class CenaPrincipal extends Phaser.Scene {
  private jogador!: Jogador;
  private relogio!: Relogio;
  private inventario!: Inventario;
  private interacao!: GerenciadorInteracao;
  private seletorFerramenta!: SeletorFerramenta;
  private mapa!: Mapa;

  constructor() {
    super('CenaPrincipal');
  }

  preload() {
    this.load.spritesheet('tiles', tilesetUrl, { frameWidth: TILE, frameHeight: TILE });
    this.load.json(CHAVE_MAPA, mapaUrl);
    this.load.image(CHAVE_IMAGEM_MAPA, imagemUrl);
  }

  create() {
    this.mapa = new Mapa(this);

    this.physics.world.setBounds(0, 0, this.mapa.largura, this.mapa.altura);
    this.cameras.main.setBounds(0, 0, this.mapa.largura, this.mapa.altura);

    this.inventario = new Inventario(this, ESTILO_TEXTO);

    // O jogador começa na frente da casa do camponês (tile livre, conferido no mapa)
    this.jogador = new Jogador(this, 106 * TILE + TILE / 2, 15 * TILE + TILE / 2);
    this.physics.add.collider(this.jogador.sprite, this.mapa.colisores);
    this.cameras.main.startFollow(this.jogador.sprite, true);

    this.seletorFerramenta = new SeletorFerramenta(this, this.inventario);

    this.interacao = new GerenciadorInteracao(this, ESTILO_TEXTO);

    this.relogio = new Relogio(this, LARGURA, ALTURA, ESTILO_TEXTO, () => {});
  }

  update(_tempo: number, delta: number) {
    this.jogador.atualizar();
    this.relogio.atualizar(delta);
    this.seletorFerramenta.atualizar();
    this.interacao.atualizar(this.jogador);
  }
}
