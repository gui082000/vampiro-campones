import { desenharBancada } from '../arte/Objetos';
import { nomeDoItem } from '../dados/itens';
import { BANCADA } from '../dados/mundo';
import { RECEITAS, type Receita } from '../dados/receitas';
import { fazer, podeFazer, receitasDe, textoDosIngredientes } from '../estado/Artesanato';
import { textoDoItem } from '../interface/textos';
import type { Mundo } from './Mundo';

// A bancada (ferramentas e materiais) e a cozinha (comidas, aberta pela casa):
// um menu com as receitas, mostrando o que falta de cada uma.
export class Artesanato {
  private mundo: Mundo;

  constructor(mundo: Mundo) {
    this.mundo = mundo;
    const r = mundo.mapa.areaEmPixels(BANCADA);
    desenharBancada(mundo.cena, r);
    mundo.mapa.criarBloqueio(BANCADA);
    mundo.interacao.registrar({ ...r, dica: () => 'Bancada · E: fazer coisas', acao: () => this.abrir('bancada') });
  }

  abrir(local: Receita['local']) {
    const { menu, inventario, avisos } = this.mundo;
    menu.abrir(local === 'bancada' ? 'Bancada' : 'Cozinha', () => [
      ...receitasDe(local).map((id) => {
        const receita: Receita = RECEITAS[id];
        const quantidade = receita.quantidade > 1 ? ` ×${receita.quantidade}` : '';
        return {
          texto: `${nomeDoItem(receita.resultado)}${quantidade}`,
          detalhe: `Precisa de: ${textoDosIngredientes(id, inventario)}\n${textoDoItem(receita.resultado)}`,
          ativa: podeFazer(id, inventario),
          aoEscolher: () => avisos.mostrar(fazer(id, inventario).aviso),
        };
      }),
      { texto: 'Fechar', aoEscolher: () => 'fechar' as const },
    ]);
  }
}
