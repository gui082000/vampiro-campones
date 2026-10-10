// O que aconteceu depois de uma ação do jogador: se mudou algo e, se for o caso,
// um aviso curto para mostrar na tela.
export interface Resultado {
  mudou: boolean;
  aviso?: string;
}

export function feito(aviso?: string): Resultado {
  return { mudou: true, aviso };
}

export function nada(aviso?: string): Resultado {
  return { mudou: false, aviso };
}

export const SEM_ENERGIA = 'Sem energia. Coma algo (F) ou durma.';
