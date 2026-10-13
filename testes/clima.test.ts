import { describe, expect, it } from 'vitest';
import { CLIMA, FOME_POR_HORA_DE_NOITE, MORCEGO, NEVOA } from '../src/config';
import { EVENTOS_ALEATORIOS } from '../src/dados/clima';
import {
  Clima,
  ceuFechado,
  chove,
  faseDaLua,
  festivalDoDia,
  luaCheia,
  raioDeVisao,
  sortearEvento,
  sortearTempo,
} from '../src/estado/Clima';
import { Energia } from '../src/estado/Energia';
import { Vampiro, impedeOVoo, passarTempo, virarNevoa, voarComoMorcego } from '../src/estado/Vampiro';

describe('Tempo do dia', () => {
  it('o sorteio segue as chances da estação', () => {
    expect(sortearTempo('primavera', () => 0)).toBe('sol');
    expect(sortearTempo('primavera', () => 0.6)).toBe('chuva');
    expect(sortearTempo('inverno', () => 0.7)).toBe('neblina');
    expect(sortearTempo('verao', () => 0.99)).toBe('tempestade');
  });

  it('chuva e tempestade regam; neblina e tempestade encurtam a vista', () => {
    const c = new Clima();
    expect(chove(c) || ceuFechado(c)).toBe(false);
    c.tempo = 'tempestade';
    expect(chove(c)).toBe(true);
    expect(raioDeVisao(c)).toBe(CLIMA.raioDeVisaoComNeblina);
    c.tempo = 'neblina';
    expect(chove(c)).toBe(false);
    expect(raioDeVisao(c)).toBeLessThan(CLIMA.raioDeVisao);
  });
});

describe('Lua', () => {
  it('ciclo de 8 dias com uma lua cheia', () => {
    const cheias = Array.from({ length: 16 }, (_, i) => i + 1).filter(luaCheia);
    expect(cheias).toEqual([4, 12]);
    expect(faseDaLua(4)).toBe('Lua cheia');
    expect(faseDaLua(8)).toBe('Lua nova');
  });

  it('na lua cheia a noite dá mais fome', () => {
    const normal = new Vampiro();
    const cheia = new Vampiro();
    normal.fome = cheia.fome = 0;
    const ctx = { hora: 22, dia: 4, foraDeCasa: true, energia: new Energia() };
    passarTempo(normal, 2, true, ctx);
    passarTempo(cheia, 2, true, { ...ctx, luaCheia: true });
    expect(normal.fome).toBeCloseTo(2 * FOME_POR_HORA_DE_NOITE);
    expect(cheia.fome).toBeCloseTo(2 * FOME_POR_HORA_DE_NOITE * CLIMA.fomeNaLuaCheia);
  });

  it('com céu fechado o sol não cansa', () => {
    const v = new Vampiro();
    v.fome = 80;
    const energia = new Energia();
    passarTempo(v, 3, false, { hora: 12, dia: 1, foraDeCasa: true, energia, ceuFechado: true });
    expect(energia.atual).toBe(energia.maxima);
  });
});

describe('Festivais e eventos', () => {
  it('um festival no dia 7 de cada estação', () => {
    expect(festivalDoDia(7)?.nome).toBe('Festa da Semeadura');
    expect(festivalDoDia(21)?.nome).toBe('Fogueira de São João');
    expect(festivalDoDia(8)).toBeNull();
  });

  it('eventos só acontecem às vezes, e o do rato só depois da primeira mordida', () => {
    expect(sortearEvento(() => 0.99, true)).toBeNull();
    // primeiro número: acontece (0); segundo: qual evento
    const sorteio = (qual: number) => {
      const numeros = [0, qual];
      return () => numeros.shift()!;
    };
    const semMordida = Array.from({ length: 20 }, (_, i) => sortearEvento(sorteio(i / 20), false));
    expect(semMordida.every((e) => e && !e.soSeJaMordeu)).toBe(true);
    const comMordida = Array.from({ length: 20 }, (_, i) => sortearEvento(sorteio(i / 20), true));
    expect(comMordida.some((e) => e?.soSeJaMordeu)).toBe(true);
    expect(EVENTOS_ALEATORIOS.filter((e) => e.soSeJaMordeu)).toHaveLength(1);
  });
});

describe('Poderes avançados', () => {
  it('névoa: só à noite, dura 1 hora e dá fome', () => {
    const v = new Vampiro();
    v.poderes.push('nevoa');
    v.fome = 10;
    expect(virarNevoa(v, false).mudou).toBe(false);
    expect(virarNevoa(v, true).mudou).toBe(true);
    expect(v.fome).toBe(10 + NEVOA.fome);
    expect(virarNevoa(v, true).mudou).toBe(false);
    passarTempo(v, NEVOA.horas, true, { hora: 22, dia: 1, foraDeCasa: true, energia: new Energia() });
    expect(v.nevoaRestante).toBe(0);
  });

  it('morcego: precisa do poder, da noite e do ar livre', () => {
    const v = new Vampiro();
    expect(impedeOVoo(v, true, true)).toBe('');
    v.poderes.push('morcego');
    expect(impedeOVoo(v, false, true)).toContain('noite');
    expect(impedeOVoo(v, true, false)).toContain('ar livre');
    expect(impedeOVoo(v, true, true)).toBeNull();
    v.fome = 0;
    voarComoMorcego(v);
    expect(v.fome).toBe(MORCEGO.fome);
  });
});
