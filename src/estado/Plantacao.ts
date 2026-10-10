import { CUSTO_DE_ENERGIA, MULTIPLICADOR_ADUBO } from '../config';
import { NA_ESTACAO, type Estacao } from '../dados/estacoes';
import { nomeDoItem } from '../dados/itens';
import { PLANTAS, plantaDaSemente, type IdPlanta } from '../dados/plantas';
import type { Energia } from './Energia';
import type { Inventario } from './Inventario';
import { SEM_ENERGIA, feito, nada, type Resultado } from './Resultado';

export interface Plantio {
  planta: IdPlanta;
  horas: number; // horas que já cresceu
  morta: boolean; // morreu na troca de estação; precisa ser tirada
}

// Uma célula do campo de plantio. Só dados simples (o desenho fica em arte/Objetos),
// para poder salvar e testar.
export interface Canteiro {
  coluna: number;
  linha: number;
  arado: boolean;
  regado: boolean; // seca todo dia às 6h
  adubado: boolean; // vale até a colheita
  plantio: Plantio | null;
}

export interface ContextoDaFazenda {
  inventario: Inventario;
  energia: Energia;
  estacao: Estacao;
}

export function novoCanteiro(coluna: number, linha: number): Canteiro {
  return { coluna, linha, arado: false, regado: false, adubado: false, plantio: null };
}

// Os canteiros que já foram mexidos (chave "coluna,linha"). Os outros são só terra.
export class Lavoura {
  canteiros: Record<string, Canteiro> = {};

  pegar(coluna: number, linha: number): Canteiro {
    const chave = `${coluna},${linha}`;
    this.canteiros[chave] ??= novoCanteiro(coluna, linha);
    return this.canteiros[chave];
  }

  todos(): Canteiro[] {
    return Object.values(this.canteiros);
  }
}

export function estaPronto(c: Canteiro): boolean {
  const p = c.plantio;
  return !!p && !p.morta && p.horas >= PLANTAS[p.planta].horas;
}

// De 0 (acabou de plantar) a 1 (pronto para colher)
export function progresso(c: Canteiro): number {
  const p = c.plantio;
  return p ? Math.min(1, p.horas / PLANTAS[p.planta].horas) : 0;
}

export function cresceAgora(planta: IdPlanta, eNoite: boolean): boolean {
  const quando = PLANTAS[planta].cresce;
  return quando === 'sempre' || (quando === 'noite') === eNoite;
}

// Faz a planta crescer durante `horas` do jogo, se estiver regada e for a hora certa
// para ela (algumas só crescem de dia, outras só à noite). Devolve true se mudou.
export function crescer(c: Canteiro, horas: number, eNoite: boolean): boolean {
  const p = c.plantio;
  if (!p || p.morta || !c.regado || estaPronto(c) || !cresceAgora(p.planta, eNoite)) return false;
  const ritmo = c.adubado ? MULTIPLICADOR_ADUBO : 1;
  p.horas = Math.min(p.horas + horas * ritmo, PLANTAS[p.planta].horas);
  return true;
}

// Novo dia: a terra seca e precisa ser regada de novo
export function secar(c: Canteiro) {
  c.regado = false;
}

// Primeiro dia de uma estação: o que não cresce nela morre. Devolve true se morreu.
export function mudarDeEstacao(c: Canteiro, estacao: Estacao): boolean {
  const p = c.plantio;
  if (!p || p.morta || (PLANTAS[p.planta].estacoes as Estacao[]).includes(estacao)) return false;
  p.morta = true;
  return true;
}

function cresceNaEstacao(planta: IdPlanta, estacao: Estacao): boolean {
  return (PLANTAS[planta].estacoes as Estacao[]).includes(estacao);
}

// Aperta E no canteiro com o item que está na mão. Colher e tirar planta morta
// funcionam com qualquer item.
export function usarNoCanteiro(c: Canteiro, ctx: ContextoDaFazenda): Resultado {
  const { inventario, energia, estacao } = ctx;
  const item = inventario.itemNaMao;
  const p = c.plantio;

  if (p && estaPronto(c)) {
    const { colheita, quantidade } = PLANTAS[p.planta];
    if (inventario.espacoPara(colheita) < quantidade) return nada('Inventário cheio');
    inventario.adicionar(colheita, quantidade);
    c.plantio = null;
    c.adubado = false;
    return feito(`+${quantidade} ${nomeDoItem(colheita)}`);
  }

  if (p?.morta) {
    c.plantio = null;
    return feito('Você tirou a planta morta');
  }

  if (item === 'enxada') {
    if (c.arado) return nada();
    if (!energia.gastar(CUSTO_DE_ENERGIA.arar)) return nada(SEM_ENERGIA);
    c.arado = true;
    return feito();
  }

  if (item === 'regador') {
    if (!c.arado || c.regado) return nada();
    if (inventario.aguaNoRegador <= 0) return nada('O regador está vazio. Encha no rio ou no poço.');
    if (!energia.gastar(CUSTO_DE_ENERGIA.regar)) return nada(SEM_ENERGIA);
    inventario.aguaNoRegador -= 1;
    c.regado = true;
    return feito();
  }

  if (item === 'adubo') {
    if (!c.arado || c.adubado) return nada();
    inventario.gastarDaMao();
    c.adubado = true;
    return feito('Terra adubada: a planta vai crescer mais rápido');
  }

  const planta = item ? plantaDaSemente(item) : undefined;
  if (planta) {
    if (!c.arado || p) return nada();
    if (!cresceNaEstacao(planta, estacao)) return nada(`${PLANTAS[planta].nome} não cresce ${NA_ESTACAO[estacao]}`);
    inventario.gastarDaMao();
    c.plantio = { planta, horas: 0, morta: false };
    return feito();
  }

  return nada();
}

// Texto de ajuda quando o jogador está olhando para o canteiro
export function dicaDoCanteiro(c: Canteiro, ctx: ContextoDaFazenda): string {
  const item = ctx.inventario.itemNaMao;
  const p = c.plantio;

  if (p) {
    const planta = PLANTAS[p.planta];
    const nome = planta.nome.toLowerCase();
    if (p.morta) return `${planta.nome} morta · E: tirar`;
    if (estaPronto(c)) return `E: colher ${nome}`;
    if (item === 'regador' && !c.regado) return `E: regar ${nome}`;
    if (item === 'adubo' && !c.adubado) return 'E: adubar';
    const quando = planta.cresce === 'dia' ? ' · só cresce de dia' : planta.cresce === 'noite' ? ' · só cresce à noite' : '';
    const agua = c.regado ? '' : ' · precisa de água';
    return `${planta.nome} ${Math.floor(progresso(c) * 100)}%${quando}${agua}`;
  }

  if (!c.arado) return item === 'enxada' ? 'E: arar a terra' : 'Terra · arar com a enxada';
  if (item === 'regador') return c.regado ? 'Terra já regada' : 'E: regar';
  if (item === 'adubo') return c.adubado ? 'Terra já adubada' : 'E: adubar';

  const planta = item ? plantaDaSemente(item) : undefined;
  if (planta) {
    return cresceNaEstacao(planta, ctx.estacao)
      ? `E: plantar ${PLANTAS[planta].nome.toLowerCase()}`
      : `${PLANTAS[planta].nome} não cresce ${NA_ESTACAO[ctx.estacao]}`;
  }
  return c.regado ? 'Terra arada e regada · escolha uma semente' : 'Terra arada · escolha uma semente';
}
