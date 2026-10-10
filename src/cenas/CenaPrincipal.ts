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
import { Diario } from '../estado/Diario';
import { Missoes } from '../estado/Missoes';
import { Relacoes } from '../estado/Relacoes';
import { Avisos } from '../interface/Avisos';
import { Dialogo } from '../interface/Dialogo';
import { TelaDoDiario } from '../interface/TelaDoDiario';
import { Aldeoes } from '../sistemas/Aldeoes';
import { Caca } from '../sistemas/Caca';
import { Vampirismo } from '../sistemas/Vampirismo';
import { Vampiro } from '../estado/Vampiro';
import { FimDeJogo } from '../interface/FimDeJogo';
import { Suspeita } from '../estado/Suspeita';
import { Evidencias } from '../sistemas/Evidencias';
import { Vigilancia } from '../sistemas/Vigilancia';
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
  private dialogo!: Dialogo;
  private telaDoDiario!: TelaDoDiario;
  aldeoes!: Aldeoes;
  caca!: Caca;
  vampirismo!: Vampirismo;
  private fimDeJogo!: FimDeJogo;
  private evidencias!: Evidencias;
  private vigilancia!: Vigilancia;

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
      relacoes: new Relacoes(),
      missoes: new Missoes(),
      diario: new Diario(),
      vampiro: new Vampiro(),
      cofre: new Recipiente(TAMANHO_DEPOSITO),
      suspeita: new Suspeita(),
      testemunhas: () => [],
    };

    const inicio = mapa.centroDaCelula(INICIO_JOGADOR);
    this.jogador = new Jogador(this, inicio.x, inicio.y);
    this.physics.add.collider(this.jogador.sprite, mapa.colisores);
    this.cameras.main.startFollow(this.jogador.sprite, true);

    this.telaDoInventario = new TelaDoInventario(this, controle, this.mundo.inventario);
    this.transicao = new Transicao(this, controle);
    this.dialogo = new Dialogo(this, controle);
    this.telaDoDiario = new TelaDoDiario(this, controle, this.mundo.diario, this.mundo.missoes, this.mundo.relacoes);

    // Prédios por dentro: as salas ficam à direita do mapa, então o mundo físico cresce
    this.interiores = new Interiores(this.mundo, this.transicao, this.jogador);
    this.physics.world.setBounds(0, 0, this.interiores.largura, this.interiores.altura);
    new Vila(this.mundo, this.interiores);
    this.aldeoes = new Aldeoes(this.mundo, this.interiores, this.dialogo, this.jogador);

    this.fazenda = new Fazenda(this.mundo);
    this.coleta = new Coleta(this.mundo);
    this.pesca = new Pesca(this.mundo);
    new Loja(this.mundo, this.interiores, this.aldeoes);
    const artesanato = new Artesanato(this.mundo);
    const construcao = new Construcao(this.mundo);
    construcao.definirUso('poco', this.pesca.usoDoPoco());
    this.animais = new Animais(this.mundo, construcao);
    new Casa(this.mundo, this.interiores, this.transicao, this.telaDoInventario, artesanato);
    this.atalhos = new BarraDeAtalhos(this.mundo);
    this.caca = new Caca(this.mundo);
    this.fimDeJogo = new FimDeJogo(this, controle);
    this.vampirismo = new Vampirismo(this.mundo, this.jogador, this.interiores, this.fimDeJogo);
    this.evidencias = new Evidencias(this.mundo, this.interiores, this.jogador);
    this.vigilancia = new Vigilancia(this.mundo, this.jogador, this.interiores, this.fimDeJogo);

    this.escurecimento = new Escurecimento(this);
    this.hud = new Hud(this, relogio, this.mundo.inventario, this.mundo.energia, this.mundo.interacao, this.mundo.vampiro, this.mundo.suspeita);

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

    // O relógio para enquanto há uma janela aberta (menu, inventário, conversa, diário)
    const janelaAberta =
      this.fimDeJogo.estaAberta || menu.estaAberto || this.telaDoInventario.estaAberta || this.dialogo.estaAberto || this.telaDoDiario.estaAberta;
    if (!janelaAberta && !this.transicao.emAndamento) {
      relogio.avancar(delta);
    }

    // Janelas primeiro: se uma estiver aberta, ela fica com as teclas
    menu.atualizar();
    this.dialogo.atualizar();
    this.telaDoInventario.atualizar();
    this.telaDoDiario.atualizar();

    this.jogador.atualizar(controle.livre);
    this.atalhos.atualizar();
    this.pesca.atualizar(delta, this.jogador);
    interacao.atualizar(this.jogador.celulaDaFrente);
    this.animais.atualizar(delta);
    this.aldeoes.atualizar(delta);
    this.caca.atualizar();
    this.vampirismo.atualizar();
    this.evidencias.atualizar();
    this.vigilancia.atualizar(delta);
    this.fimDeJogo.atualizar();

    this.escurecimento.atualizar(relogio.hora, this.vampirismo.visao);
    avisos.atualizar(delta);
    this.hud.atualizar();
  }
}
