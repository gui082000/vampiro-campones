import type { IdItem } from '../dados/itens';
import { PEIXES } from '../dados/peixes';

// Sorteia o peixe que mordeu a isca, entre os que aparecem nessa hora (dia ou noite)
export function sortearPeixe(eNoite: boolean, aleatorio: () => number): IdItem {
  const possiveis = PEIXES.filter((p) => p.quando === 'sempre' || (p.quando === 'noite') === eNoite);
  const total = possiveis.reduce((soma, p) => soma + p.peso, 0);
  let sorteio = aleatorio() * total;
  for (const peixe of possiveis) {
    sorteio -= peixe.peso;
    if (sorteio < 0) return peixe.item;
  }
  return possiveis[possiveis.length - 1].item;
}
