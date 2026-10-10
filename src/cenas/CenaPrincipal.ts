import Phaser from 'phaser';
import { carregarArte } from '../arte/carregar';
import { criarIcones } from '../arte/Icones';
import { TAMANHO_DEPOSITO } from '../config';
import { CHEGADA_DA_ESTACAO } from '../dados/estacoes';
import { INICIO_JOGADOR } from '../dados/mundo';
import { estacaoDoDia } from '../estado/Calendario';
import { Construcoes } from '../estado/Construcoes';
import { Criacao } from '../estado/Criacao';
import { Energia } from '../estado/Energia';
import { Inventario } from '../estado/Inventario';
import { Recipiente } from '../estado/Recipiente';
import { Avisos } from '../interface/Avisos';
import { Escurecimento } from '../interface/Escurecimento';
import { Hud } from '../interface/Hud';
import { Menu } from '../interface/Menu';
import { TelaDoInventario } from '../interface/TelaDoInventario';
import { Transicao } from '../interface/Transicao';
import { Animais } from '../sistemas/Animais';
import { Artesanato } from '../sistemas/Artesanato';
import { BarraDeAtalhos } from '../sistemas/BarraDeAtalhos';
import { Casa } from '../sistemas/Casa';
import { Coleta } from '../sistemas/Coleta';
import { Construcao } from '../sistemas/Construcao';
import { Fazenda } from '../sistemas/Fazenda';
import { Interacao } from '../sistemas/Interacao';
import { Interiores } from '../sistemas/Interiores';
import { Vila } from '../sistemas/Vila';
import { Jogador } from '../sistemas/Jogador';
import { Loja } from '../sistemas/Loja';
import { Mapa } from '../sistemas/Mapa';
import type { Mundo } from '../sistemas/Mundo';
import { Pesca } from '../sistemas/Pesca';
import { Relogio } from '../sistemas/Relogio';
import { Controle } from '../util/Controle';

// Monta a cena a partir das peças e liga a atualização de cada uma por quadro.
// Cada mecânica nova ganha seu próprio arquivo em src/sistemas e é conectada aqui.
export class CenaPrincipal extends Phaser.Scene {
  // Públicos para os testes no navegador (e, na Fase 6, para salvar o jogo)
  mundo!: Mundo;
  jogador!: Jogador;
  fazenda!: Fazenda;
  coleta!: Coleta;
  interiores!: Interiores;

  private atalhos!: BarraDeAtalhos;
  private pesca!: Pesca;
  private animais!: Animais;
  private telaDoInventario!: TelaDoInventario;
  private transicao!: Transicao;
  private escurecimento!: Escurecimento;
  private hud!: Hud;

  constructor() {
    super('CenaPrincipal');
  }

  preload() {
    carregarArte(this);
  }

  create() {
    criarIcones(this);
    const mapa = new Mapa(this);
    this.physics.world.setBounds(0, 0, mapa.largura, mapa.altura);
    this.cameras.main.setBounds(0, 0, mapa.largura, mapa.altura);

    const controle = new Controle();
    const relogio = new Relogio();
    this.mundo = {
      cena: this,
      mapa,
      relogio,
      controle,
      interacao: new Interacao(this, controle),
      menu: new Menu(this, controle),
      avisos: new Avisos(this),
      inventario: new Inventario(),
      energia: new Energia(),
      construcoes: new Construcoes(),
      criacao: new Criacao(),
      deposito: new Recipiente(TAMANHO_DEPOSITO),
    };

    const inicio = mapa.centroDaCelula(INICIO_JOGADOR);
    this.jogador = new Jogador(this, inicio.x, inicio.y);
    this.physics.add.collider(this.jogador.sprite, mapa.colisores);
    this.cameras.main.startFollow(this.jogador.sprite, true);

    this.telaDoInventario = new TelaDoInventario(this, controle, this.mundo.inventario);
    this.transicao = new Transicao(this, controle);

    // Prédios por dentro: as salas ficam à direita do mapa, então o mundo físico cresce
    this.interiores = new Interiores(this.mundo, this.transicao, this.jogador);
    this.physics.world.setBounds(0, 0, this.interiores.largura, this.interiores.altura);
    new Vila(this.mundo, this.interiores);

    this.fazenda = new Fazenda(this.mundo);
    this.coleta = new Coleta(this.mundo);
    this.pesca = new Pesca(this.mundo);
    new Loja(this.mundo, this.interiores);
    const artesanato = new Artesanato(this.mundo);
    const construcao = new Construcao(this.mundo);
    construcao.definirUso('poco', this.pesca.usoDoPoco());
    this.animais = new Animais(this.mundo, construcao);
    new Casa(this.mundo, this.interiores, this.transicao, this.telaDoInventario, artesanato);
    this.atalhos = new BarraDeAtalhos(this.mundo);

    this.escurecimento = new Escurecimento(this);
    this.hud = new Hud(this, relogio, this.mundo.inventario, this.mundo.energia, this.mundo.interacao);

    // Estação: tom do mapa e aviso no primeiro dia
    mapa.aplicarEstacao(relogio.estacao);
    relogio.ouvir('novo-dia', (dia) => {
      const estacao = estacaoDoDia(dia);
      mapa.aplicarEstacao(estacao);
      if (estacao !== estacaoDoDia(dia - 1)) this.mundo.avisos.mostrar(`${CHEGADA_DA_ESTACAO[estacao]}!`);
    });
  }

  update(_tempo: number, delta: number) {
    const { relogio, menu, controle, interacao, avisos } = this.mundo;

    // O relógio para enquanto há um menu ou o inventário aberto
    if (!menu.estaAberto && !this.telaDoInventario.estaAberta && !this.transicao.emAndamento) {
      relogio.avancar(delta);
    }

    // Janelas primeiro: se uma estiver aberta, ela fica com as teclas
    menu.atualizar();
    this.telaDoInventario.atualizar();

    this.jogador.atualizar(controle.livre);
    this.atalhos.atualizar();
    this.pesca.atualizar(delta, this.jogador);
    interacao.atualizar(this.jogador.celulaDaFrente);
    this.animais.atualizar(delta);

    this.escurecimento.atualizar(relogio.hora);
    avisos.atualizar(delta);
    this.hud.atualizar();
  }
}
