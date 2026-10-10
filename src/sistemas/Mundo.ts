import type Phaser from 'phaser';
import type { Construcoes } from '../estado/Construcoes';
import type { Criacao } from '../estado/Criacao';
import type { Energia } from '../estado/Energia';
import type { Inventario } from '../estado/Inventario';
import type { Recipiente } from '../estado/Recipiente';
import type { Avisos } from '../interface/Avisos';
import type { Menu } from '../interface/Menu';
import type { Controle } from '../util/Controle';
import type { Interacao } from './Interacao';
import type { Mapa } from './Mapa';
import type { Relogio } from './Relogio';

// O que os sistemas do jogo compartilham. É montado uma vez na CenaPrincipal e
// entregue a cada sistema, em vez de uma lista enorme de parâmetros.
export interface Mundo {
  cena: Phaser.Scene;
  mapa: Mapa;
  relogio: Relogio;
  controle: Controle;
  interacao: Interacao;
  menu: Menu;
  avisos: Avisos;

  // Estado do jogo (o que será salvo na Fase 6)
  inventario: Inventario;
  energia: Energia;
  construcoes: Construcoes;
  criacao: Criacao;
  deposito: Recipiente;
}
