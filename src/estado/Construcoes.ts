import { CONSTRUCOES, type IdConstrucao } from '../dados/construcoes';
import { nomeDoItem, type IdItem } from '../dados/itens';
import { quantidade } from '../util/texto';
import type { Inventario } from './Inventario';
import { feito, nada, type Resultado } from './Resultado';

// O que já foi construído. Só dados simples, para poder salvar.
export class Construcoes {
  feitas: Partial<Record<IdConstrucao, true>> = {};

  tem(id: IdConstrucao): boolean {
    return !!this.feitas[id];
  }
}

function materiais(id: IdConstrucao): [IdItem, number][] {
  return Object.entries(CONSTRUCOES[id].materiais) as [IdItem, number][];
}

// Ex.: "20 madeira, 10 pedra e 150 moedas"
export function textoDoCusto(id: IdConstrucao): string {
  const partes = materiais(id).map(([item, qtd]) => `${qtd} ${nomeDoItem(item).toLowerCase()}`);
  if (CONSTRUCOES[id].moedas > 0) partes.push(quantidade(CONSTRUCOES[id].moedas, 'moeda', 'moedas'));
  return partes.length > 1 ? `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}` : partes[0];
}

// O que falta para construir (lista vazia = dá para construir)
export function faltaPara(id: IdConstrucao, inventario: Inventario): string[] {
  const falta = materiais(id)
    .filter(([item, qtd]) => !inventario.tem(item, qtd))
    .map(([item, qtd]) => `${qtd - inventario.quantidade(item)} ${nomeDoItem(item).toLowerCase()}`);
  const moedas = CONSTRUCOES[id].moedas;
  if (inventario.moedas < moedas) falta.push(quantidade(moedas - inventario.moedas, 'moeda', 'moedas'));
  return falta;
}

export function construir(id: IdConstrucao, construcoes: Construcoes, inventario: Inventario): Resultado {
  const nome = CONSTRUCOES[id].nome;
  if (construcoes.tem(id)) return nada(`${nome} já foi construído`);
  const falta = faltaPara(id, inventario);
  if (falta.length > 0) return nada(`Falta: ${falta.join(', ')}`);

  for (const [item, qtd] of materiais(id)) inventario.remover(item, qtd);
  inventario.moedas -= CONSTRUCOES[id].moedas;
  construcoes.feitas[id] = true;
  return feito(`${nome} construído!`);
}
