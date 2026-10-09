import { PRECO_SEMENTE, PRECO_VENDA } from '../config';
import type { Inventario } from './Inventario';

// Regras de compra e venda, usadas pela barraca de sementes e pela caixa de venda.

// Compra 1 semente, se houver moedas. Devolve se a compra aconteceu.
export function comprarSemente(inventario: Inventario): boolean {
  if (inventario.moedas < PRECO_SEMENTE) return false;
  inventario.moedas -= PRECO_SEMENTE;
  inventario.sementes += 1;
  return true;
}

// Vende todo o trigo. Devolve quantas moedas entraram.
export function venderTrigo(inventario: Inventario): number {
  const ganho = inventario.trigo * PRECO_VENDA;
  inventario.moedas += ganho;
  inventario.trigo = 0;
  return ganho;
}
