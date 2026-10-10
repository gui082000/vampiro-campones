import type { Estacao } from '../dados/estacoes';

// Tom aplicado à imagem do mapa em cada estação (multiplica as cores; branco = sem mudança)
export const TINTA_DO_MAPA: Record<Estacao, number> = {
  primavera: 0xeefff0,
  verao: 0xfffbe8,
  outono: 0xffffff,
  inverno: 0xd8e2f4,
};
