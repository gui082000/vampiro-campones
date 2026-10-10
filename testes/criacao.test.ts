import { describe, expect, it } from 'vitest';
import { CAPACIDADE_DO_ABRIGO, CAPACIDADE_DO_COMEDOURO, ESPECIES } from '../src/dados/animais';
import {
  Criacao,
  comprarAnimal,
  encherComedouro,
  passarDiaDaCriacao,
  recolherDoAbrigo,
  recolherDoAnimal,
} from '../src/estado/Criacao';
import { Inventario } from '../src/estado/Inventario';
import { criarAleatorio } from '../src/util/aleatorio';

function comGalinhas(qtd: number) {
  const criacao = new Criacao();
  const inventario = new Inventario([]);
  inventario.moedas = 10_000;
  const aleatorio = criarAleatorio(3);
  for (let i = 0; i < qtd; i++) comprarAnimal(criacao, 'galinheiro', inventario, aleatorio);
  return { criacao, inventario, galinheiro: criacao.abrigos.galinheiro };
}

describe('Animais', () => {
  it('comprar custa o preço, dá um nome e respeita o espaço do abrigo', () => {
    const { criacao, inventario, galinheiro } = comGalinhas(1);
    expect(inventario.moedas).toBe(10_000 - ESPECIES.galinha.preco);
    expect(ESPECIES.galinha.nomes).toContain(galinheiro.animais[0].nome);

    for (let i = 1; i < CAPACIDADE_DO_ABRIGO.galinheiro; i++) comprarAnimal(criacao, 'galinheiro', inventario, Math.random);
    expect(comprarAnimal(criacao, 'galinheiro', inventario, Math.random).mudou).toBe(false);
    const nomes = galinheiro.animais.map((a) => a.nome);
    expect(new Set(nomes).size).toBe(nomes.length);
  });

  it('sem moedas não compra', () => {
    const criacao = new Criacao();
    const inventario = new Inventario([]);
    inventario.moedas = 0;
    expect(comprarAnimal(criacao, 'celeiro', inventario, Math.random).mudou).toBe(false);
  });

  it('o comedouro aceita trigo e feno, até encher', () => {
    const { inventario, galinheiro } = comGalinhas(1);
    expect(encherComedouro(galinheiro, inventario).mudou).toBe(false);

    inventario.adicionar('trigo', 8);
    inventario.adicionar('feno', 10);
    encherComedouro(galinheiro, inventario);
    expect(galinheiro.comedouro).toBe(CAPACIDADE_DO_COMEDOURO);
    expect(inventario.quantidade('trigo') + inventario.quantidade('feno')).toBe(18 - CAPACIDADE_DO_COMEDOURO);
  });

  it('animal que comeu deixa um produto no dia seguinte; sem comida, nada', () => {
    const { criacao, inventario, galinheiro } = comGalinhas(2);
    galinheiro.comedouro = 1;

    passarDiaDaCriacao(criacao, false, 'primavera');
    expect(galinheiro.comedouro).toBe(0);
    expect(galinheiro.animais.filter((a) => a.produtoPronto)).toHaveLength(1);

    expect(recolherDoAbrigo(galinheiro, inventario).mudou).toBe(true);
    expect(inventario.quantidade('ovo')).toBe(1);
    expect(recolherDoAbrigo(galinheiro, inventario).aviso).toBe('Nada para recolher');
  });

  it('com a cerca do pasto os animais pastam e não gastam o comedouro, menos no inverno', () => {
    const { criacao, galinheiro } = comGalinhas(1);
    galinheiro.comedouro = 3;

    passarDiaDaCriacao(criacao, true, 'verao');
    expect(galinheiro.comedouro).toBe(3);
    expect(galinheiro.animais[0].produtoPronto).toBe(true);

    passarDiaDaCriacao(criacao, true, 'inverno');
    expect(galinheiro.comedouro).toBe(2);
  });

  it('dá para recolher direto do animal', () => {
    const { inventario, galinheiro } = comGalinhas(1);
    const galinha = galinheiro.animais[0];
    expect(recolherDoAnimal(galinha, inventario).mudou).toBe(false);
    galinha.produtoPronto = true;
    expect(recolherDoAnimal(galinha, inventario).mudou).toBe(true);
    expect(inventario.quantidade('ovo')).toBe(1);
  });
});
