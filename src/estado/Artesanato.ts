import { nomeDoItem, type IdItem } from '../dados/itens';
import { RECEITAS, type IdReceita, type Receita } from '../dados/receitas';
import type { Inventario } from './Inventario';
import { feito, nada, type Resultado } from './Resultado';

function ingredientes(receita: Receita): [IdItem, number][] {
  return Object.entries(receita.ingredientes) as [IdItem, number][];
}

// Receitas que aparecem para o jogador naquele lugar (as bloqueadas ficam de fora)
export function receitasDe(local: Receita['local']): IdReceita[] {
  return (Object.keys(RECEITAS) as IdReceita[]).filter((id) => {
    const receita: Receita = RECEITAS[id];
    return receita.local === local && !receita.bloqueada;
  });
}

export function podeFazer(id: IdReceita, inventario: Inventario): boolean {
  return ingredientes(RECEITAS[id]).every(([item, qtd]) => inventario.tem(item, qtd));
}

// Ex.: "madeira 3/5, fibra 3/3"
export function textoDosIngredientes(id: IdReceita, inventario: Inventario): string {
  return ingredientes(RECEITAS[id])
    .map(([item, qtd]) => `${nomeDoItem(item).toLowerCase()} ${Math.min(inventario.quantidade(item), qtd)}/${qtd}`)
    .join(', ');
}

export function fazer(id: IdReceita, inventario: Inventario): Resultado {
  const receita: Receita = RECEITAS[id];
  if (!podeFazer(id, inventario)) return nada('Faltam ingredientes');

  // Os ingredientes saem antes, então o espaço deles conta para o resultado
  for (const [item, qtd] of ingredientes(receita)) inventario.remover(item, qtd);
  const resto = inventario.adicionar(receita.resultado, receita.quantidade);
  if (resto > 0) {
    // Não coube: desfaz tudo
    inventario.remover(receita.resultado, receita.quantidade - resto);
    for (const [item, qtd] of ingredientes(receita)) inventario.adicionar(item, qtd);
    return nada('Inventário cheio');
  }
  return feito(`+${receita.quantidade} ${nomeDoItem(receita.resultado)}`);
}
