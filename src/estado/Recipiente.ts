import { definicaoDoItem, type IdItem } from '../dados/itens';

export interface Pilha {
  item: IdItem;
  qtd: number;
}

export function pilhaMaxima(item: IdItem): number {
  return definicaoDoItem(item).pilhaMaxima ?? 99;
}

// Espaços que guardam pilhas de itens (o inventário do Tomás, o baú do depósito).
// Só dados simples, para poder salvar e testar.
export class Recipiente {
  slots: (Pilha | null)[];

  constructor(tamanho: number) {
    this.slots = Array.from({ length: tamanho }, () => null);
  }

  quantidade(item: IdItem): number {
    return this.slots.reduce((total, s) => total + (s?.item === item ? s.qtd : 0), 0);
  }

  tem(item: IdItem, qtd = 1): boolean {
    return this.quantidade(item) >= qtd;
  }

  // Quantos desse item ainda cabem
  espacoPara(item: IdItem): number {
    const max = pilhaMaxima(item);
    return this.slots.reduce((total, s) => {
      if (s === null) return total + max;
      return s.item === item ? total + max - s.qtd : total;
    }, 0);
  }

  // Guarda o item, completando primeiro as pilhas iguais. Devolve quanto NÃO coube.
  adicionar(item: IdItem, qtd: number): number {
    const max = pilhaMaxima(item);
    let resto = qtd;
    for (const s of this.slots) {
      if (resto === 0) break;
      if (s?.item !== item || s.qtd >= max) continue;
      const n = Math.min(resto, max - s.qtd);
      s.qtd += n;
      resto -= n;
    }
    for (let i = 0; i < this.slots.length && resto > 0; i++) {
      if (this.slots[i] !== null) continue;
      const n = Math.min(resto, max);
      this.slots[i] = { item, qtd: n };
      resto -= n;
    }
    return resto;
  }

  // Tira a quantidade, se houver tudo (senão não tira nada). Começa pelas últimas
  // pilhas, para não esvaziar a barra de atalhos à toa.
  remover(item: IdItem, qtd: number): boolean {
    if (!this.tem(item, qtd)) return false;
    let resto = qtd;
    for (let i = this.slots.length - 1; i >= 0 && resto > 0; i--) {
      const s = this.slots[i];
      if (s?.item !== item) continue;
      const n = Math.min(resto, s.qtd);
      s.qtd -= n;
      resto -= n;
      if (s.qtd === 0) this.slots[i] = null;
    }
    return true;
  }

  // Tira do espaço indicado (ex.: a semente que está na mão)
  removerDoSlot(indice: number, qtd = 1): boolean {
    const s = this.slots[indice];
    if (!s || s.qtd < qtd) return false;
    s.qtd -= qtd;
    if (s.qtd === 0) this.slots[indice] = null;
    return true;
  }

  trocar(a: number, b: number) {
    [this.slots[a], this.slots[b]] = [this.slots[b], this.slots[a]];
  }

  // Passa a pilha deste espaço para outro recipiente (juntando com pilhas iguais).
  // O que não couber fica onde estava.
  moverPara(indice: number, destino: Recipiente) {
    const s = this.slots[indice];
    if (!s) return;
    const resto = destino.adicionar(s.item, s.qtd);
    if (resto === 0) this.slots[indice] = null;
    else s.qtd = resto;
  }
}
