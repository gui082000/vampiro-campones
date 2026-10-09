// Escreve a quantidade com a palavra no singular ou no plural, ex.: "1 moeda", "3 moedas"
export function quantidade(n: number, singular: string, plural: string): string {
  return `${n} ${n === 1 ? singular : plural}`;
}
