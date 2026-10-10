// Pistas que o Tomás descobriu (lápides, livros, conversas). Os finais descobertos
// entram aqui na Fase 7. Só dados simples, para poder salvar.
export class Diario {
  pistas: string[] = [];
  finais: string[] = [];

  // Anota se ainda não estiver anotada. Devolve se era nova.
  anotar(pista: string): boolean {
    if (this.pistas.includes(pista)) return false;
    this.pistas.push(pista);
    return true;
  }
}
