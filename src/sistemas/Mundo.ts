import type Phaser from 'phaser';
import type { Construcoes } from '../estado/Construcoes';
import type { Criacao } from '../estado/Criacao';
import type { Diario } from '../estado/Diario';
import type { Missoes } from '../estado/Missoes';
import type { Relacoes } from '../estado/Relacoes';
import type { Vampiro } from '../estado/Vampiro';
import type { Suspeita } from '../estado/Suspeita';
import type { IdAldeao } from '../dados/aldeoes';
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
  relacoes: Relacoes;
  missoes: Missoes;
  diario: Diario;
  vampiro: Vampiro;
  cofre: Recipiente; // cofre do porão
  suspeita: Suspeita;
  // Aldeões acordados que estão vendo o Tomás agora (preenchido pelo sistema de aldeões)
  testemunhas: () => IdAldeao[];
}

// Chamado em toda mordida: quem estiver acordado e perto viu tudo
export function registrarMordida(mundo: Mundo) {
  for (const id of mundo.testemunhas()) mundo.vampiro.registro.push(`visto:${id}`);
}

// Anota uma pista no diário e avisa, só na primeira vez
export function anotarPista(mundo: Mundo, pista: string) {
  if (mundo.diario.anotar(pista)) mundo.avisos.mostrar('Pista anotada no diário (J)');
}
