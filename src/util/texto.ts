// Escreve a quantidade com a palavra no singular ou no plural, ex.: "1 moeda", "3 moedas"
export function quantidade(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

// Junta uma lista em português: "a", "a e b", "a, b e c"
export function listar(itens: string[]): string {
  if (itens.length <= 1) return itens[0] ?? '';
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}

// Número com vírgula e no máximo uma casa decimal, ex.: 1,5
export function numero(n: number): string {
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}
