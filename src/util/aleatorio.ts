// Gerador de números aleatórios com semente: a mesma semente dá sempre a mesma
// sequência (usado para espalhar árvores e pedras sempre nos mesmos lugares e para
// os testes serem repetíveis). Devolve números de 0 (incluso) a 1 (excluso).
export function criarAleatorio(semente: number): () => number {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Inteiro sorteado entre min e max (os dois inclusos)
export function inteiroEntre(aleatorio: () => number, min: number, max: number): number {
  return min + Math.floor(aleatorio() * (max - min + 1));
}
