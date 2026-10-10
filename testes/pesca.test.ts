import { describe, expect, it } from 'vitest';
import { sortearPeixe } from '../src/estado/Pesca';

// Testa vários sorteios espalhados entre 0 e 1
function todosOsSorteios(eNoite: boolean) {
  return Array.from({ length: 100 }, (_, i) => sortearPeixe(eNoite, () => i / 100));
}

describe('Pesca', () => {
  it('de dia não sai traíra; de noite não sai lambari', () => {
    expect(todosOsSorteios(false)).not.toContain('traira');
    expect(todosOsSorteios(true)).not.toContain('lambari');
  });

  it('o peixe raro também aparece', () => {
    expect(todosOsSorteios(false)).toContain('bagre');
    expect(todosOsSorteios(true)).toContain('bagre');
  });
});
