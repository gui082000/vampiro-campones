import { describe, expect, it } from 'vitest';
import { PRECO_SEMENTE, PRECO_VENDA } from '../src/config';
import { comprarSemente, venderTrigo } from '../src/estado/Comercio';
import { Inventario } from '../src/estado/Inventario';

describe('Comércio', () => {
  it('não compra semente sem moedas suficientes', () => {
    const inventario = new Inventario();
    inventario.moedas = PRECO_SEMENTE - 1;
    const sementesAntes = inventario.sementes;

    expect(comprarSemente(inventario)).toBe(false);
    expect(inventario.sementes).toBe(sementesAntes);
    expect(inventario.moedas).toBe(PRECO_SEMENTE - 1);
  });

  it('comprar semente desconta o preço e entrega 1 semente', () => {
    const inventario = new Inventario();
    inventario.moedas = PRECO_SEMENTE;
    const sementesAntes = inventario.sementes;

    expect(comprarSemente(inventario)).toBe(true);
    expect(inventario.sementes).toBe(sementesAntes + 1);
    expect(inventario.moedas).toBe(0);
  });

  it('a caixa de venda troca todo o trigo por moedas', () => {
    const inventario = new Inventario();
    inventario.trigo = 3;
    inventario.moedas = 0;

    expect(venderTrigo(inventario)).toBe(3 * PRECO_VENDA);
    expect(inventario.trigo).toBe(0);
    expect(inventario.moedas).toBe(3 * PRECO_VENDA);
  });
});
