import { desenharCaixaDeVenda } from '../arte/Objetos';
import { definicaoDoItem, nomeDoItem } from '../dados/itens';
import { CAIXA_DE_VENDA } from '../dados/mundo';
import { comprar, itensVendaveis, sementesAVenda, vendaRapida, vender, venderTudo } from '../estado/Comercio';
import { textoDoItem } from '../interface/textos';
import { quantidade } from '../util/texto';
import type { Interiores } from './Interiores';
import type { Mundo } from './Mundo';

const moedas = (n: number) => quantidade(n, 'moeda', 'moedas');

// Balcão da loja da vila (vende as sementes da estação) e caixa de venda no pátio da
// fazenda (compra o que o Tomás produz).
export class Loja {
  private mundo: Mundo;

  constructor(mundo: Mundo, interiores: Interiores) {
    this.mundo = mundo;
    const { mapa, cena, interacao } = mundo;

    interiores.definirUso('loja', 'balcaoDaLoja', {
      dica: () => 'Balcão da loja · E: comprar sementes',
      acao: () => this.abrirSementes(),
    });

    const caixa = mapa.areaEmPixels(CAIXA_DE_VENDA);
    desenharCaixaDeVenda(cena, caixa);
    mapa.criarBloqueio(CAIXA_DE_VENDA);
    interacao.registrar({ ...caixa, dica: () => 'Caixa de venda · E: vender', acao: () => this.abrirCaixa() });
  }

  private abrirSementes() {
    const { menu, inventario, relogio, avisos } = this.mundo;
    menu.abrir(
      () => `Sementes da estação · ${moedas(inventario.moedas)}`,
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
