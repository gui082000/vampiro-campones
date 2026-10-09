import { describe, expect, it } from 'vitest';
import { COLHEITA_POR_PLANTA, HORAS_PARA_CRESCER, SEMENTES_INICIAIS } from '../src/config';
import type { Ferramenta } from '../src/dados/ferramentas';
import { Inventario } from '../src/estado/Inventario';
import { crescer, estaPronto, novoCanteiro, usarNoCanteiro } from '../src/estado/Plantacao';

// Usa a ferramenta indicada no canteiro, como se o jogador apertasse E com ela na mão
function usar(ferramenta: Ferramenta, canteiro = novoCanteiro(0, 0), inventario = new Inventario()) {
  inventario.ferramenta = ferramenta;
  const mudou = usarNoCanteiro(canteiro, inventario);
  return { canteiro, inventario, mudou };
}

// Canteiro já plantado, para os testes de crescimento
function canteiroPlantado() {
  const { canteiro, inventario } = usar('enxada');
  usar('sementes', canteiro, inventario);
  return { canteiro, inventario };
}

describe('Plantação', () => {
  it('a enxada ara a terra', () => {
    const { canteiro, mudou } = usar('enxada');
    expect(mudou).toBe(true);
    expect(canteiro.solo).toBe('arado');
  });

  it('plantar gasta 1 semente', () => {
    const { canteiro, inventario } = canteiroPlantado();
    expect(canteiro.solo).toBe('plantado');
    expect(inventario.sementes).toBe(SEMENTES_INICIAIS - 1);
  });

  it('não planta sem sementes', () => {
    const { canteiro, inventario } = usar('enxada');
    inventario.sementes = 0;
    const { mudou } = usar('sementes', canteiro, inventario);
    expect(mudou).toBe(false);
    expect(canteiro.solo).toBe('arado');
  });

  it('não dá para plantar nem regar terra que não foi arada', () => {
    expect(usar('sementes').mudou).toBe(false);
    expect(usar('regador').mudou).toBe(false);
  });

  it('sem água a planta não cresce', () => {
    const { canteiro } = canteiroPlantado();
    expect(crescer(canteiro, HORAS_PARA_CRESCER)).toBe(false);
    expect(canteiro.horasCrescendo).toBe(0);
  });

  it(`regada, fica pronta depois de ${HORAS_PARA_CRESCER} horas do jogo`, () => {
    const { canteiro, inventario } = canteiroPlantado();
    usar('regador', canteiro, inventario);

    crescer(canteiro, HORAS_PARA_CRESCER - 1);
    expect(estaPronto(canteiro)).toBe(false);

    crescer(canteiro, 1);
    expect(estaPronto(canteiro)).toBe(true);
  });

  it(`colher dá ${COLHEITA_POR_PLANTA} trigo e deixa a terra arada, sem água`, () => {
    const { canteiro, inventario } = canteiroPlantado();
    usar('regador', canteiro, inventario);
    crescer(canteiro, HORAS_PARA_CRESCER);

    const { mudou } = usar('enxada', canteiro, inventario); // colher funciona com qualquer ferramenta
    expect(mudou).toBe(true);
    expect(inventario.trigo).toBe(COLHEITA_POR_PLANTA);
    expect(canteiro.solo).toBe('arado');
    expect(canteiro.regado).toBe(false);
  });
});
