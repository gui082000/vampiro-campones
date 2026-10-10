import { describe, expect, it } from 'vitest';
import { SUSPEITA } from '../src/config';
import { Suspeita, faixa, lerRegistro, nivel, passarDiaDaSuspeita, somarSuspeita } from '../src/estado/Suspeita';

describe('Suspeita da vila', () => {
  it('começa calma e muda de faixa conforme sobe', () => {
    const s = new Suspeita();
    expect(faixa(s).nome).toBe('Calma');
    expect(somarSuspeita(s, 25)).toContain('Boatos');
    expect(nivel(s)).toBe(1);
    s.valor = 85;
    expect(faixa(s).nome).toBe('Caça aberta');
  });

  it('o registro da noite vira suspeita uma única vez', () => {
    const s = new Suspeita();
    const registro = ['cervo:um cervo', 'desaparecido:bento', 'testemunha:helena'];
    lerRegistro(s, registro);
    expect(s.valor).toBe(SUSPEITA.aldeaoDesaparecido + SUSPEITA.vitimaLembra);
    lerRegistro(s, registro);
    expect(s.valor).toBe(SUSPEITA.aldeaoDesaparecido + SUSPEITA.vitimaLembra);
  });

  it('ser visto mordendo pesa muito e avisa quem viu', () => {
    const s = new Suspeita();
    const avisos = lerRegistro(s, ['visto:orlando']);
    expect(s.valor).toBe(SUSPEITA.vistoMordendo);
    expect(avisos[0]).toContain('Orlando viu');
  });

  it('a vila esquece aos poucos, mas acha os corpos não escondidos', () => {
    const s = new Suspeita();
    s.valor = 30;
    passarDiaDaSuspeita(s);
    expect(s.valor).toBe(30 - SUSPEITA.quedaPorDia);

    s.corpos.push({ sala: 'fora', coluna: 1, linha: 1, quem: 'um viajante' });
    const avisos = passarDiaDaSuspeita(s);
    expect(s.corpos).toHaveLength(0);
    expect(avisos.join(' ')).toContain('Encontraram o corpo');
    expect(s.valor).toBe(30 - 2 * SUSPEITA.quedaPorDia + SUSPEITA.corpoEncontrado);
  });

  it('em 100 a vila lincha', () => {
    const s = new Suspeita();
    somarSuspeita(s, 150);
    expect(s.valor).toBe(100);
    expect(s.linchado).toBe(true);
  });

  it('não fica negativa', () => {
    const s = new Suspeita();
    somarSuspeita(s, SUSPEITA.doacaoNaIgreja);
    expect(s.valor).toBe(0);
  });
});
