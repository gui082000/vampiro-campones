import { CAPACIDADE_REGADOR, MOEDAS_INICIAIS, TAMANHO_BARRA, TAMANHO_INVENTARIO } from '../config';
import { ITENS_INICIAIS, type IdItem } from '../dados/itens';
import { Recipiente, type Pilha } from './Recipiente';
import { feito, nada, type Resultado } from './Resultado';

// O que o Tomás carrega. Os 8 primeiros espaços são a barra de atalhos (teclas 1 a 8)
// e o item selecionado nela é o que está na mão. Só dados simples, para poder
// salvar e testar.
export class Inventario extends Recipiente {
  selecionado = 0;
  moedas = MOEDAS_INICIAIS;
  aguaNoRegador = CAPACIDADE_REGADOR;

  constructor(iniciais: { item: IdItem; qtd: number }[] = ITENS_INICIAIS) {
    super(TAMANHO_INVENTARIO);
    for (const { item, qtd } of iniciais) this.adicionar(item, qtd);
  }

  get pilhaNaMao(): Pilha | null {
    return this.slots[this.selecionado];
  }

  get itemNaMao(): IdItem | null {
    return this.pilhaNaMao?.item ?? null;
  }

  selecionar(indice: number) {
    if (indice >= 0 && indice < TAMANHO_BARRA) this.selecionado = indice;
  }

  // Usa 1 do item que está na mão (ex.: plantar uma semente)
  gastarDaMao(): boolean {
    return this.removerDoSlot(this.selecionado, 1);
  }

  // No rio ou no poço
  encherRegador(): Resultado {
    if (this.aguaNoRegador >= CAPACIDADE_REGADOR) return nada('O regador já está cheio');
    this.aguaNoRegador = CAPACIDADE_REGADOR;
    return feito('Regador cheio');
  }
}
