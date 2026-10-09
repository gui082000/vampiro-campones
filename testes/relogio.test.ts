import { describe, expect, it } from 'vitest';
import { HORA_AMANHECER, HORA_ANOITECER, HORA_INICIAL, SEGUNDOS_POR_HORA } from '../src/config';
import { Relogio } from '../src/sistemas/Relogio';

const UMA_HORA_MS = SEGUNDOS_POR_HORA * 1000; // 1 hora do jogo em milissegundos reais

// Avança o relógio aos pouquinhos (1 minuto do jogo por vez), como no jogo,
// onde ele anda um quadro de cada vez
function avancarHoras(relogio: Relogio, horas: number) {
  for (let i = 0; i < Math.round(horas * 60); i++) relogio.avancar(UMA_HORA_MS / 60);
}

// Guarda a ordem em que os eventos do relógio acontecem
function gravarEventos(relogio: Relogio): string[] {
  const eventos: string[] = [];
  relogio.ouvir('novo-dia', (dia) => eventos.push(`novo-dia ${dia}`));
  relogio.ouvir('amanheceu', () => eventos.push('amanheceu'));
  relogio.ouvir('anoiteceu', () => eventos.push('anoiteceu'));
  return eventos;
}

describe('Relógio', () => {
  it('começa no dia 1, de dia, na hora inicial', () => {
    const relogio = new Relogio();
    expect(relogio.dia).toBe(1);
    expect(relogio.hora).toBe(HORA_INICIAL);
    expect(relogio.eNoite).toBe(false);
  });

  it(`1 hora do jogo dura ${SEGUNDOS_POR_HORA} segundos reais`, () => {
    const relogio = new Relogio();
    relogio.avancar(UMA_HORA_MS);
    expect(relogio.hora).toBeCloseTo(HORA_INICIAL + 1);
  });

  it('avisa "anoiteceu" uma única vez, na hora do anoitecer', () => {
    const relogio = new Relogio();
    const eventos = gravarEventos(relogio);

    avancarHoras(relogio, HORA_ANOITECER - HORA_INICIAL - 0.5);
    expect(eventos).toEqual([]);
    expect(relogio.eNoite).toBe(false);

    avancarHoras(relogio, 1);
    expect(eventos).toEqual(['anoiteceu']);
    expect(relogio.eNoite).toBe(true);
  });

  it('de manhã vira o dia e avisa "amanheceu"', () => {
    const relogio = new Relogio();
    const eventos = gravarEventos(relogio);

    // do começo até meia hora depois do amanhecer do dia seguinte
    avancarHoras(relogio, 24 - HORA_INICIAL + HORA_AMANHECER + 0.5);

    expect(relogio.dia).toBe(2);
    expect(relogio.eNoite).toBe(false);
    expect(eventos).toEqual(['anoiteceu', 'novo-dia 2', 'amanheceu']);
  });

  it('um salto grande de uma vez (ex.: dormir) avisa cada marco uma vez, na ordem', () => {
    const relogio = new Relogio();
    const eventos = gravarEventos(relogio);

    relogio.avancar(24 * UMA_HORA_MS);

    expect(eventos).toEqual(['anoiteceu', 'novo-dia 2', 'amanheceu']);
    expect(relogio.dia).toBe(2);
    expect(relogio.hora).toBeCloseTo(HORA_INICIAL);
  });

  it('mostra o horário no formato hh:mm', () => {
    const relogio = new Relogio();
    relogio.hora = 7.5;
    expect(relogio.horario).toBe('07:30');
    relogio.hora = 23.25;
    expect(relogio.horario).toBe('23:15');
  });
});
