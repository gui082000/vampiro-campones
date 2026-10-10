import { describe, expect, it } from 'vitest';
import { TAMANHO_INVENTARIO } from '../src/config';
import { ITENS_INICIAIS } from '../src/dados/itens';
import { Inventario } from '../src/estado/Inventario';
import { Recipiente } from '../src/estado/Recipiente';

describe('Inventário em grade', () => {
  it('começa com os itens iniciais na barra, na ordem', () => {
    const inventario = new Inventario();
    ITENS_INICIAIS.forEach(({ item, qtd }, i) => expect(inventario.slots[i]).toEqual({ item, qtd }));
    expect(inventario.itemNaMao).toBe(ITENS_INICIAIS[0].item);
  });

  it('junta itens iguais na mesma pilha até 99 e depois usa outro espaço', () => {
    const inventario = new Inventario([]);
    inventario.adicionar('madeira', 60);
    inventario.adicionar('madeira', 60);
    expect(inventario.slots[0]).toEqual({ item: 'madeira', qtd: 99 });
    expect(inventario.slots[1]).toEqual({ item: 'madeira', qtd: 21 });
    expect(inventario.quantidade('madeira')).toBe(120);
  });

  it('ferramentas não empilham', () => {
    const inventario = new Inventario([]);
    inventario.adicionar('enxada', 2);
    expect(inventario.slots[0]).toEqual({ item: 'enxada', qtd: 1 });
    expect(inventario.slots[1]).toEqual({ item: 'enxada', qtd: 1 });
  });

  it('devolve o que não coube', () => {
    const inventario = new Inventario([]);
    expect(inventario.adicionar('pedra', TAMANHO_INVENTARIO * 99 + 5)).toBe(5);
    expect(inventario.espacoPara('pedra')).toBe(0);
    expect(inventario.espacoPara('madeira')).toBe(0);
  });

  it('remover é tudo ou nada, e tira primeiro das últimas pilhas', () => {
    const inventario = new Inventario([]);
    inventario.adicionar('madeira', 120); // 99 no espaço 0 e 21 no espaço 1
    expect(inventario.remover('madeira', 200)).toBe(false);
    expect(inventario.quantidade('madeira')).toBe(120);

    expect(inventario.remover('madeira', 30)).toBe(true);
    expect(inventario.slots[0]).toEqual({ item: 'madeira', qtd: 90 });
    expect(inventario.slots[1]).toBeNull();
  });

  it('gastar da mão tira do espaço selecionado e esvazia quando acaba', () => {
    const inventario = new Inventario([{ item: 'sementeTrigo', qtd: 1 }]);
    expect(inventario.gastarDaMao()).toBe(true);
    expect(inventario.itemNaMao).toBeNull();
    expect(inventario.gastarDaMao()).toBe(false);
  });

  it('só dá para selecionar espaços da barra de atalhos', () => {
    const inventario = new Inventario([]);
    inventario.selecionar(7);
    expect(inventario.selecionado).toBe(7);
    inventario.selecionar(8);
    expect(inventario.selecionado).toBe(7);
  });

  it('move uma pilha para outro recipiente, juntando com a pilha igual', () => {
    const inventario = new Inventario([{ item: 'trigo', qtd: 10 }]);
    const bau = new Recipiente(4);
    bau.adicionar('trigo', 5);

    inventario.moverPara(0, bau);
    expect(inventario.slots[0]).toBeNull();
    expect(bau.slots[0]).toEqual({ item: 'trigo', qtd: 15 });
  });

  it('troca dois espaços de lugar', () => {
    const inventario = new Inventario([{ item: 'enxada', qtd: 1 }, { item: 'regador', qtd: 1 }]);
    inventario.trocar(0, 1);
    expect(inventario.slots[0]?.item).toBe('regador');
    expect(inventario.slots[1]?.item).toBe('enxada');
  });
});
