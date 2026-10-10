import { describe, expect, it } from 'vitest';
import { ITENS } from '../src/dados/itens';
import { Energia, comer } from '../src/estado/Energia';
import { Inventario } from '../src/estado/Inventario';

describe('Energia', () => {
  it('não gasta o que não tem', () => {
    const energia = new Energia();
    energia.atual = 2;
    expect(energia.gastar(3)).toBe(false);
    expect(energia.atual).toBe(2);
    expect(energia.gastar(2)).toBe(true);
    expect(energia.atual).toBe(0);
  });

  it('comer recupera energia e gasta 1 do item da mão', () => {
    const energia = new Energia();
    energia.atual = 10;
    const inventario = new Inventario([{ item: 'amora', qtd: 2 }]);

    expect(comer(inventario, energia).mudou).toBe(true);
    expect(energia.atual).toBe(10 + ITENS.amora.energia);
    expect(inventario.quantidade('amora')).toBe(1);
  });

  it('não come com a energia cheia nem o que não é comida', () => {
    const energia = new Energia();
    expect(comer(new Inventario([{ item: 'amora', qtd: 1 }]), energia).aviso).toBe('Você está sem fome');

    energia.atual = 10;
    expect(comer(new Inventario([{ item: 'pedra', qtd: 1 }]), energia).mudou).toBe(false);
  });

  it('não passa do máximo', () => {
    const energia = new Energia();
    energia.atual = energia.maxima - 3;
    expect(energia.recuperar(50)).toBe(3);
    expect(energia.atual).toBe(energia.maxima);
  });

  it('ao acordar sobe até a fração do máximo, mas nunca desce', () => {
    const energia = new Energia();
    energia.atual = 10;
    energia.acordar(0.8);
    expect(energia.atual).toBe(Math.round(energia.maxima * 0.8));

    energia.atual = energia.maxima;
    energia.acordar(0.8);
    expect(energia.atual).toBe(energia.maxima);
  });
});
