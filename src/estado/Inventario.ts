import { MOEDAS_INICIAIS, SEMENTES_INICIAIS } from '../config';
import type { Ferramenta } from '../dados/ferramentas';

// Recursos do jogador e a ferramenta na mão. Só dados simples (quem desenha é o HUD),
// para poder salvar e testar.
export class Inventario {
  ferramenta: Ferramenta = 'enxada';
  sementes = SEMENTES_INICIAIS;
  trigo = 0;
  moedas = MOEDAS_INICIAIS;
}
