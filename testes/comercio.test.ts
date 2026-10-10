import { describe, expect, it } from 'vitest';
import { ITENS } from '../src/dados/itens';
import { comprar, itensVendaveis, sementesAVenda, vender, venderTudo } from '../src/estado/Comercio';
import { Inventario } from '../src/estado/Inventario';

describe('Comércio', () => {
  it('a barraca só vende sementes da estação', () => {
    const primavera = sementesAVenda('primavera');
    expect(primavera).toContain('sementeTrigo');
    expect(primavera).toContain('sementeBatata');
    expect(primavera).not.toContain('sementeGirassol');
    expect(sementesAVenda('verao')).toContain('sementeGirassol');
  });

  it('não compra sem moedas suficientes', () => {
    const inventario = new Inventario([]);
    inventario.moedas = ITENS.sementeBatata.precoCompra - 1;
    expect(comprar('sementeBatata', inventario).mudou).toBe(false);
    expect(inventario.quantidade('sementeBatata')).toBe(0);
  });

  it('comprar desconta o preço e entrega 1 unidade', () => {
    const inventario = new Inventario([]);
    inventario.moedas = 100;
    expect(comprar('sementeBatata', inventario).mudou).toBe(true);
    expect(inventario.quantidade('sementeBatata')).toBe(1);
    expect(inventario.moedas).toBe(100 - ITENS.sementeBatata.precoCompra);
  });

  it('a caixa aceita o que tem preço de venda (ferramentas e sementes não)', () => {
    const inventario = new Inventario([
      { item: 'enxada', qtd: 1 },
      { item: 'sementeTrigo', qtd: 3 },
      { item: 'trigo', qtd: 4 },
      { item: 'ovo', qtd: 2 },
    ]);
    expect(itensVendaveis(inventario).map((v) => v.item)).toEqual(['trigo', 'ovo']);
  });

  it('vende tudo de um item, ou tudo de uma vez', () => {
    const inventario = new Inventario([{ item: 'trigo', qtd: 4 }, { item: 'ovo', qtd: 2 }]);
    inventario.moedas = 0;

    vender('trigo', inventario);
    expect(inventario.quantidade('trigo')).toBe(0);
    expect(inventario.moedas).toBe(4 * ITENS.trigo.precoVenda);

    venderTudo(inventario);
    expect(inventario.quantidade('ovo')).toBe(0);
    expect(inventario.moedas).toBe(4 * ITENS.trigo.precoVenda + 2 * ITENS.ovo.precoVenda);
  });
});
