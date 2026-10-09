import Phaser from 'phaser';
import { carregarArte } from '../arte/carregar';
import { BARRACA_DE_SEMENTES, CAIXA_DE_VENDA, INICIO_JOGADOR } from '../dados/mundo';
import { Inventario } from '../estado/Inventario';
import { Escurecimento } from '../interface/Escurecimento';
import { Hud } from '../interface/Hud';
import { Fazenda } from '../sistemas/Fazenda';
import { Ferramentas } from '../sistemas/Ferramentas';
import { Interacao } from '../sistemas/Interacao';
import { Jogador } from '../sistemas/Jogador';
import { criarBarracaDeSementes, criarCaixaDeVenda } from '../sistemas/Loja';
import { Mapa } from '../sistemas/Mapa';
import { Relogio } from '../sistemas/Relogio';

// Monta a cena a partir das peças e liga a atualização de cada uma por quadro.
// Cada mecânica nova ganha seu próprio arquivo em src/sistemas e é conectada aqui.
export class CenaPrincipal extends Phaser.Scene {
  private relogio!: Relogio;
  private inventario!: Inventario;
  private jogador!: Jogador;
  private fazenda!: Fazenda;
  private ferramentas!: Ferramentas;
  private interacao!: Interacao;
  private escurecimento!: Escurecimento;
  private hud!: Hud;

  constructor() {
    super('CenaPrincipal');
  }

  preload() {
    carregarArte(this);
  }

  create() {
    const mapa = new Mapa(this);
    this.physics.world.setBounds(0, 0, mapa.largura, mapa.altura);
    this.cameras.main.setBounds(0, 0, mapa.largura, mapa.altura);

    this.relogio = new Relogio();
    this.inventario = new Inventario();

    const inicio = mapa.centroDaCelula(INICIO_JOGADOR);
    this.jogador = new Jogador(this, inicio.x, inicio.y);
    this.physics.add.collider(this.jogador.sprite, mapa.colisores);
    this.cameras.main.startFollow(this.jogador.sprite, true);

    this.fazenda = new Fazenda(this, mapa, this.inventario);
    this.ferramentas = new Ferramentas(this, this.inventario);

    const barraca = mapa.centroDaCelula(BARRACA_DE_SEMENTES);
    const caixa = mapa.centroDaCelula(CAIXA_DE_VENDA);
    this.interacao = new Interacao(this);
    this.interacao.registrar(
      ...this.fazenda.obterInteragiveis(),
      criarBarracaDeSementes(this, this.inventario, barraca.x, barraca.y),
      criarCaixaDeVenda(this, this.inventario, caixa.x, caixa.y),
    );

    this.escurecimento = new Escurecimento(this);
    this.hud = new Hud(this, this.relogio, this.inventario, this.interacao);
  }

  update(_tempo: number, delta: number) {
    const horasPassadas = this.relogio.avancar(delta);

    this.jogador.atualizar();
    this.fazenda.atualizar(horasPassadas);
    this.ferramentas.atualizar();
    this.interacao.atualizar(this.jogador);
    this.escurecimento.atualizar(this.relogio.hora);
    this.hud.atualizar();
  }
}
