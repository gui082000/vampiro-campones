import { describe, expect, it } from 'vitest';
import { FOME_ALTA, HORA_AMANHECER, HORA_ANOITECER, SUSPEITA } from '../src/config';
import { Energia } from '../src/estado/Energia';
import { luaCheia } from '../src/estado/Clima';
import { Vampiro, beber, fecharDia, passarTempo } from '../src/estado/Vampiro';

// Simula um dia inteiro (dia + noite) e, se quiser, uma refeição à noite
function viverDias(v: Vampiro, dias: number, comer: (v: Vampiro, dia: number) => void) {
  const horasDeDia = HORA_ANOITECER - HORA_AMANHECER;
  for (let dia = 1; dia <= dias; dia++) {
    const ctx = { hora: 12, dia, foraDeCasa: false, energia: new Energia(), luaCheia: luaCheia(dia) };
    passarTempo(v, horasDeDia, false, ctx);
    passarTempo(v, 24 - horasDeDia, true, ctx);
    comer(v, dia);
    if (fecharDia(v)) return dia;
  }
  return null;
}

describe('Balanceamento', () => {
  it('a rota pacífica é possível: um cervo por noite deixa a fome longe da fome alta', () => {
    const v = new Vampiro();
    const sucumbiu = viverDias(v, 56, (v) => beber(v, 'cervo', 'um cervo'));
    expect(sucumbiu).toBeNull();
    expect(v.fome).toBeLessThan(FOME_ALTA);
  });

  it('sem comer nada, a fome vence em poucos dias', () => {
    const v = new Vampiro();
    const sucumbiu = viverDias(v, 30, () => {});
    expect(sucumbiu).not.toBeNull();
    expect(sucumbiu!).toBeLessThanOrEqual(6);
  });

  it('só animais da fazenda não bastam sozinhos: é preciso caçar também', () => {
    const v = new Vampiro();
    viverDias(v, 40, (v) => beber(v, 'animalDaFazenda', 'a galinha'));
    expect(v.fome).toBeGreaterThanOrEqual(FOME_ALTA);
  });

  it('matar um aldeão pesa mais na suspeita que tudo o mais', () => {
    const outros = Object.entries(SUSPEITA).filter(([k, n]) => k !== 'aldeaoDesaparecido' && n > 0);
    for (const [, n] of outros) expect(SUSPEITA.aldeaoDesaparecido).toBeGreaterThan(n);
  });
});
