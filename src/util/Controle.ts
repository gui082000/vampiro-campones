// Quem está usando o teclado agora. Enquanto alguma janela estiver aberta (menu,
// inventário) ou o jogador estiver ocupado (pescando, dormindo), o mundo ignora as
// teclas de andar e de usar.
export class Controle {
  private ocupantes = new Set<string>();

  ocupar(quem: string) {
    this.ocupantes.add(quem);
  }

  liberar(quem: string) {
    this.ocupantes.delete(quem);
  }

  get livre(): boolean {
    return this.ocupantes.size === 0;
  }
}
