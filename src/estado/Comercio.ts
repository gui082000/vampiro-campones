import { ITENS, definicaoDoItem, nomeDoItem, type IdItem } from '../dados/itens';
import { PLANTAS } from '../dados/plantas';
import type { Estacao } from '../dados/estacoes';
import { quantidade } from '../util/texto';
import type { Inventario } from './Inventario';
import { feito, nada, type Resultado } from './Resultado';

const moedas = (n: number) => quantidade(n, 'moeda', 'moedas');

// Sementes que a barraca vende: as das plantas que crescem na estação
export function sementesAVenda(estacao: Estacao): IdItem[] {
  return Object.values(PLANTAS)
    .filter((p) => (p.estacoes as Estacao[]).includes(estacao))
    .map((p) => p.semente as IdItem)
    .filter((semente) => definicaoDoItem(semente).precoCompra !== undefined);
}

// Compra 1 unidade. Devolve se a compra aconteceu.
export function comprar(item: IdItem, inventario: Inventario): Resultado {
  const preco = definicaoDoItem(item).precoCompra;
  if (preco === undefined) return nada();
  if (inventario.moedas < preco) return nada(`Custa ${moedas(preco)}`);
  if (inventario.espacoPara(item) < 1) return nada('Inventário cheio');
  inventario.moedas -= preco;
  inventario.adicionar(item, 1);
  return feito(`+1 ${nomeDoItem(item)}`);
}

// Itens do inventário que a caixa de venda aceita, com quantos há de cada
export function itensVendaveis(inventario: Inventario): { item: IdItem; qtd: number; valor: number }[] {
  return (Object.keys(ITENS) as IdItem[])
    .filter((item) => definicaoDoItem(item).precoVenda !== undefined && inventario.tem(item))
    .map((item) => {
      const qtd = inventario.quantidade(item);
      return { item, qtd, valor: qtd * (definicaoDoItem(item).precoVenda ?? 0) };
    });
}

// Vende tudo o que houver desse item. Devolve quanto ganhou.
export function vender(item: IdItem, inventario: Inventario): Resultado {
  const preco = definicaoDoItem(item).precoVenda;
  const qtd = inventario.quantidade(item);
  if (preco === undefined || qtd === 0) return nada();
  inventario.remover(item, qtd);
  inventario.moedas += qtd * preco;
  return feito(`Vendeu ${qtd} ${nomeDoItem(item).toLowerCase()} por ${moedas(qtd * preco)}`);
}

// O que entra no "vender tudo": tudo o que tem preço, menos materiais de construção
// (madeira, pedra, feno...), para ninguém vender o que juntou para construir sem querer
export function vendaRapida(inventario: Inventario): { item: IdItem; qtd: number; valor: number }[] {
  return itensVendaveis(inventario).filter((v) => definicaoDoItem(v.item).tipo !== 'material');
}

// Vende de uma vez tudo o que entra na venda rápida
export function venderTudo(inventario: Inventario): Resultado {
  const lista = vendaRapida(inventario);
  if (lista.length === 0) return nada('Nada para vender');
  const total = lista.reduce((soma, v) => soma + v.valor, 0);
  for (const { item } of lista) vender(item, inventario);
  return feito(`Vendeu tudo por ${moedas(total)}`);
}
