import { describe, expect, it } from 'vitest';
import { CONSTRUCOES } from '../src/dados/construcoes';
import { Construcoes, construir, faltaPara, textoDoCusto } from '../src/estado/Construcoes';
import { Inventario } from '../src/estado/Inventario';

describe('Construção', () => {
  it('descreve o custo por extenso', () => {
    expect(textoDoCusto('galinheiro')).toBe(
      `${CONSTRUCOES.galinheiro.materiais.madeira} madeira, ${CONSTRUCOES.galinheiro.materiais.pedra} pedra e ${CONSTRUCOES.galinheiro.moedas} moedas`,
    );
  });

  it('diz o que falta e não constrói sem tudo', () => {
    const inventario = new Inventario([{ item: 'madeira', qtd: 5 }]);
    inventario.moedas = 0;
    const construcoes = new Construcoes();

    expect(faltaPara('cama', inventario)).toEqual([
      `${CONSTRUCOES.cama.materiais.madeira - 5} madeira`,
      `${CONSTRUCOES.cama.moedas} moedas`,
    ]);
    expect(construir('cama', construcoes, inventario).mudou).toBe(false);
    expect(construcoes.tem('cama')).toBe(false);
    expect(inventario.quantidade('madeira')).toBe(5);
  });

  it('construir gasta os materiais e as moedas, e só uma vez', () => {
    const inventario = new Inventario([{ item: 'madeira', qtd: 30 }, { item: 'pedra', qtd: 30 }]);
    inventario.moedas = 500;
    const construcoes = new Construcoes();

    expect(construir('galinheiro', construcoes, inventario).mudou).toBe(true);
    expect(construcoes.tem('galinheiro')).toBe(true);
    expect(inventario.quantidade('madeira')).toBe(30 - CONSTRUCOES.galinheiro.materiais.madeira);
    expect(inventario.quantidade('pedra')).toBe(30 - CONSTRUCOES.galinheiro.materiais.pedra);
    expect(inventario.moedas).toBe(500 - CONSTRUCOES.galinheiro.moedas);

    expect(construir('galinheiro', construcoes, inventario).mudou).toBe(false);
  });
});
