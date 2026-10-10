import { desenharCaixaDeVenda } from '../arte/Objetos';
import { definicaoDoItem, nomeDoItem, type IdItem } from '../dados/itens';
import { LOJA_ABRE, LOJA_FECHA, OUTROS_ITENS_DA_LOJA } from '../dados/loja';
import type { Aldeoes } from './Aldeoes';
import { nivel } from '../estado/Suspeita';
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

  constructor(mundo: Mundo, interiores: Interiores, aldeoes: Aldeoes) {
    this.mundo = mundo;
    const { mapa, cena, interacao, relogio, avisos } = mundo;

    const aberta = () => relogio.hora >= LOJA_ABRE && relogio.hora < LOJA_FECHA && aldeoes.salaDe('cida') === 'loja';
    interiores.definirUso('loja', 'balcaoDaLoja', {
      dica: () => (aberta() ? 'Balcão da loja · E: comprar' : `Balcão · fechado (abre às ${LOJA_ABRE}h)`),
      acao: () => (aberta() ? this.abrirLoja() : avisos.mostrar(`A loja abre das ${LOJA_ABRE}h às ${LOJA_FECHA}h.`)),
    });

    const caixa = mapa.areaEmPixels(CAIXA_DE_VENDA);
    desenharCaixaDeVenda(cena, caixa);
    mapa.criarBloqueio(CAIXA_DE_VENDA);
    interacao.registrar({ ...caixa, dica: () => 'Caixa de venda · E: vender', acao: () => this.abrirCaixa() });
  }

  private abrirLoja() {
    const { menu, inventario, relogio, avisos } = this.mundo;
    const caro = nivel(this.mundo.suspeita) >= 2 ? 1.25 : 1; // na desconfiança, tudo mais caro
    const opcao = (item: IdItem, precoNormal: number) => {
      const preco = Math.ceil(precoNormal * caro);
      return {
      texto: `${nomeDoItem(item)} — ${moedas(preco)}`,
      detalhe: textoDoItem(item),
      ativa: inventario.moedas >= preco,
      aoEscolher: () => avisos.mostrar(comprar(item, inventario, preco).aviso),
      };
    };
    menu.abrir(
      () => `Loja da Dona Cida · ${moedas(inventario.moedas)}`,
      () => [
        ...sementesAVenda(relogio.estacao).map((semente) => opcao(semente, definicaoDoItem(semente).precoCompra ?? 0)),
        ...OUTROS_ITENS_DA_LOJA.map(({ item, preco }) => opcao(item, preco)),
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
