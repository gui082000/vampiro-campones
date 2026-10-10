import { desenharBarraca, desenharCaixaDeVenda } from '../arte/Objetos';
import { definicaoDoItem, nomeDoItem } from '../dados/itens';
import { BARRACA_DE_SEMENTES, CAIXA_DE_VENDA } from '../dados/mundo';
import { comprar, itensVendaveis, sementesAVenda, vendaRapida, vender, venderTudo } from '../estado/Comercio';
import { textoDoItem } from '../interface/textos';
import { quantidade } from '../util/texto';
import type { Mundo } from './Mundo';

const moedas = (n: number) => quantidade(n, 'moeda', 'moedas');

// Barraca de sementes (vende as sementes da estação) e caixa de venda (compra o que
// o Tomás produz). Ficam no pátio da casa até a vila existir.
export class Loja {
  private mundo: Mundo;

  constructor(mundo: Mundo) {
    this.mundo = mundo;
    const { mapa, cena, interacao } = mundo;

    const barraca = mapa.areaEmPixels(BARRACA_DE_SEMENTES);
    desenharBarraca(cena, barraca);
    mapa.criarBloqueio(BARRACA_DE_SEMENTES);
    interacao.registrar({ ...barraca, dica: () => 'Barraca de sementes · E: comprar', acao: () => this.abrirBarraca() });

    const caixa = mapa.areaEmPixels(CAIXA_DE_VENDA);
    desenharCaixaDeVenda(cena, caixa);
    mapa.criarBloqueio(CAIXA_DE_VENDA);
    interacao.registrar({ ...caixa, dica: () => 'Caixa de venda · E: vender', acao: () => this.abrirCaixa() });
  }

  private abrirBarraca() {
    const { menu, inventario, relogio, avisos } = this.mundo;
    menu.abrir(
      () => `Barraca de sementes · ${moedas(inventario.moedas)}`,
      () => [
        ...sementesAVenda(relogio.estacao).map((semente) => {
          const preco = definicaoDoItem(semente).precoCompra ?? 0;
          return {
            texto: `${nomeDoItem(semente)} — ${moedas(preco)}`,
            detalhe: textoDoItem(semente),
            ativa: inventario.moedas >= preco,
            aoEscolher: () => avisos.mostrar(comprar(semente, inventario).aviso),
          };
        }),
        { texto: 'Fechar', aoEscolher: () => 'fechar' as const },
      ],
    );
  }

  private abrirCaixa() {
    const { menu, inventario, avisos } = this.mundo;
    menu.abrir(
      () => `Caixa de venda · ${moedas(inventario.moedas)}`,
      () => {
        const rapida = vendaRapida(inventario);
        const total = rapida.reduce((soma, v) => soma + v.valor, 0);
        return [
          {
            texto: rapida.length > 0 ? `Vender tudo — ${moedas(total)}` : 'Nada para vender de uma vez',
            detalhe: 'Vende colheitas, peixes, produtos dos animais e comidas. Materiais de construção só um por um, abaixo.',
            ativa: rapida.length > 0,
            aoEscolher: () => avisos.mostrar(venderTudo(inventario).aviso),
          },
          ...itensVendaveis(inventario).map((v) => ({
            texto: `${nomeDoItem(v.item)} ×${v.qtd} — ${moedas(v.valor)}`,
            detalhe: textoDoItem(v.item),
            aoEscolher: () => avisos.mostrar(vender(v.item, inventario).aviso),
          })),
          { texto: 'Fechar', aoEscolher: () => 'fechar' as const },
        ];
      },
    );
  }
}
