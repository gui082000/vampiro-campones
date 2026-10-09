// Emissor de eventos simples e tipado, sem depender do Phaser: assim um sistema pode
// avisar os outros (ex.: o relógio avisa "anoiteceu") e as regras continuam testáveis.
// `T` lista os eventos e o que cada um entrega, ex.: { 'novo-dia': [dia: number] }.
export class Eventos<T extends Record<string, unknown[]>> {
  private ouvintes = new Map<keyof T, ((...dados: any[]) => void)[]>();

  // Registra uma função para ser chamada toda vez que o evento acontecer
  ouvir<N extends keyof T>(evento: N, ouvinte: (...dados: T[N]) => void) {
    const lista = this.ouvintes.get(evento) ?? [];
    lista.push(ouvinte);
    this.ouvintes.set(evento, lista);
  }

  protected emitir<N extends keyof T>(evento: N, ...dados: T[N]) {
    for (const ouvinte of this.ouvintes.get(evento) ?? []) ouvinte(...dados);
  }
}
