import { ENERGIA_MAXIMA } from '../config';
import { definicaoDoItem } from '../dados/itens';
import type { Inventario } from './Inventario';
import { feito, nada, type Resultado } from './Resultado';

// Energia do camponês: as ferramentas gastam; comer e dormir recuperam.
export class Energia {
  atual = ENERGIA_MAXIMA;
  readonly maxima = ENERGIA_MAXIMA;

  // Gasta se tiver o bastante (senão não gasta nada). Devolve se deu.
  gastar(qtd: number): boolean {
    if (this.atual < qtd) return false;
    this.atual -= qtd;
    return true;
  }

  // Devolve quanto de fato recuperou (não passa do máximo)
  recuperar(qtd: number): number {
    const antes = this.atual;
    this.atual = Math.min(this.maxima, this.atual + qtd);
    return this.atual - antes;
  }

  // Ao acordar a energia sobe até essa fração do máximo (nunca desce)
  acordar(fracao: number) {
    this.atual = Math.max(this.atual, Math.round(this.maxima * fracao));
  }
}

// Come 1 do item que está na mão (tecla F)
export function comer(inventario: Inventario, energia: Energia): Resultado {
  const pilha = inventario.pilhaNaMao;
  if (!pilha) return nada();
  const { nome, energia: valor } = definicaoDoItem(pilha.item);
  if (!valor) return nada(`${nome} não é de comer`);
  if (energia.atual >= energia.maxima) return nada('Você está sem fome');

  inventario.gastarDaMao();
  const ganho = energia.recuperar(valor);
  return feito(`Comeu ${nome.toLowerCase()}: +${ganho} de energia`);
}
