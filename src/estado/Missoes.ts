import type { IdAldeao } from '../dados/aldeoes';
import { nomeDoItem, type IdItem } from '../dados/itens';
import { MISSOES, type DefinicaoDeMissao, type IdMissao } from '../dados/missoes';
import type { Inventario } from './Inventario';
import type { Relacoes } from './Relacoes';
import { feito, nada, type Resultado } from './Resultado';

export type SituacaoDaMissao = 'ativa' | 'concluida';

// Missões aceitas e concluídas. Só dados simples, para poder salvar.
export class Missoes {
  situacao: Partial<Record<IdMissao, SituacaoDaMissao>> = {};

  ativas(): IdMissao[] {
    return (Object.keys(this.situacao) as IdMissao[]).filter((id) => this.situacao[id] === 'ativa');
  }

  concluidas(): IdMissao[] {
    return (Object.keys(this.situacao) as IdMissao[]).filter((id) => this.situacao[id] === 'concluida');
  }
}

function missoesDe(aldeao: IdAldeao): IdMissao[] {
  return (Object.keys(MISSOES) as IdMissao[]).filter((id) => MISSOES[id].aldeao === aldeao);
}

function itensDa(id: IdMissao): [IdItem, number][] {
  const missao: DefinicaoDeMissao = MISSOES[id];
  return Object.entries(missao.itens) as [IdItem, number][];
}

// Ex.: "5 trigo" ou "10 fibra e 5 madeira"
export function textoDoPedido(id: IdMissao): string {
  return itensDa(id)
    .map(([item, qtd]) => `${qtd} ${nomeDoItem(item).toLowerCase()}`)
    .join(' e ');
}

// A missão que o aldeão tem para oferecer agora (a próxima não feita, se a amizade deixar)
export function missaoDisponivel(missoes: Missoes, relacoes: Relacoes, aldeao: IdAldeao): IdMissao | null {
  for (const id of missoesDe(aldeao)) {
    const situacao = missoes.situacao[id];
    if (situacao === 'concluida') continue;
    if (situacao === 'ativa') return null;
    return relacoes.coracoes(aldeao) >= MISSOES[id].coracoes ? id : null;
  }
  return null;
}

export function missaoAtiva(missoes: Missoes, aldeao: IdAldeao): IdMissao | null {
  return missoesDe(aldeao).find((id) => missoes.situacao[id] === 'ativa') ?? null;
}

export function aceitar(missoes: Missoes, id: IdMissao): Resultado {
  if (missoes.situacao[id]) return nada();
  missoes.situacao[id] = 'ativa';
  return feito(`Nova missão: ${MISSOES[id].titulo}`);
}

export function podeEntregar(id: IdMissao, inventario: Inventario): boolean {
  return itensDa(id).every(([item, qtd]) => inventario.tem(item, qtd));
}

export function entregar(missoes: Missoes, id: IdMissao, inventario: Inventario, relacoes: Relacoes): Resultado {
  if (missoes.situacao[id] !== 'ativa') return nada();
  if (!podeEntregar(id, inventario)) return nada(`Falta: ${textoDoPedido(id)}`);
  const missao: DefinicaoDeMissao = MISSOES[id];
  for (const [item, qtd] of itensDa(id)) inventario.remover(item, qtd);
  inventario.moedas += missao.moedas;
  relacoes.somar(missao.aldeao, missao.amizade);
  missoes.situacao[id] = 'concluida';
  return feito(`Missão concluída: ${missao.titulo} (+${missao.moedas} moedas)`);
}
