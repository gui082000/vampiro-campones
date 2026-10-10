import { describe, expect, it } from 'vitest';
import { RECEITAS } from '../src/dados/receitas';
import { fazer, podeFazer, receitasDe, textoDosIngredientes } from '../src/estado/Artesanato';
import { Inventario } from '../src/estado/Inventario';

describe('Artesanato', () => {
  it('a bancada não mostra as receitas bloqueadas (itens do vampiro)', () => {
    const bancada = receitasDe('bancada');
    expect(bancada).toContain('varaDePesca');
    expect(bancada).not.toContain('unguentoSolar');
    expect(receitasDe('cozinha')).toContain('pao');
  });

  it('fazer gasta os ingredientes e entrega o resultado', () => {
    const inventario = new Inventario([{ item: 'madeira', qtd: 6 }, { item: 'fibra', qtd: 3 }]);
    expect(podeFazer('varaDePesca', inventario)).toBe(true);
    expect(fazer('varaDePesca', inventario).mudou).toBe(true);
    expect(inventario.quantidade('varaDePesca')).toBe(1);
    expect(inventario.quantidade('madeira')).toBe(6 - RECEITAS.varaDePesca.ingredientes.madeira);
    expect(inventario.quantidade('fibra')).toBe(0);
  });

  it('sem os ingredientes não faz nada', () => {
    const inventario = new Inventario([{ item: 'trigo', qtd: 2 }]);
    expect(fazer('pao', inventario).mudou).toBe(false);
    expect(inventario.quantidade('trigo')).toBe(2);
    expect(textoDosIngredientes('pao', inventario)).toBe(`trigo 2/${RECEITAS.pao.ingredientes.trigo}`);
  });

  // Inventário com a fibra no primeiro espaço e pedras em todos os outros
  function lotado(fibras: number) {
    const inventario = new Inventario([{ item: 'fibra', qtd: fibras }]);
    for (let i = 1; i < inventario.slots.length; i++) inventario.slots[i] = { item: 'pedra', qtd: 99 };
    return inventario;
  }

  it('o espaço liberado pelos ingredientes serve para o resultado', () => {
    const inventario = lotado(4); // a fibra toda sai e o feno entra no lugar dela
    expect(fazer('feno', inventario).mudou).toBe(true);
    expect(inventario.quantidade('feno')).toBe(RECEITAS.feno.quantidade);
  });

  it('se o resultado não couber, desfaz e devolve os ingredientes', () => {
    const inventario = lotado(8); // sobra fibra no espaço, então o feno não tem onde ficar
    expect(fazer('feno', inventario).aviso).toBe('Inventário cheio');
    expect(inventario.quantidade('fibra')).toBe(8);
    expect(inventario.quantidade('feno')).toBe(0);
  });
});
