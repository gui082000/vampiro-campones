import { desenharPorta } from '../arte/Objetos';
import { ENERGIA_AO_ACORDAR_NA_PALHA, HORA_ACORDAR } from '../config';
import { CONSTRUCOES, type IdConstrucao } from '../dados/construcoes';
import { PORTA_DA_CASA } from '../dados/mundo';
import { textoDaData } from '../estado/Calendario';
import { construir, faltaPara, textoDoCusto } from '../estado/Construcoes';
import type { TelaDoInventario } from '../interface/TelaDoInventario';
import type { Transicao } from '../interface/Transicao';
import type { Artesanato } from './Artesanato';
import type { Mundo } from './Mundo';

const MELHORIAS: IdConstrucao[] = ['cama', 'cozinha', 'deposito'];

// A porta da casa do Tomás: dormir até de manhã, cozinhar, abrir o depósito e
// melhorar a casa (cama de madeira, cozinha, depósito).
export class Casa {
  private mundo: Mundo;
  private transicao: Transicao;
  private telaDoInventario: TelaDoInventario;
  private artesanato: Artesanato;

  constructor(mundo: Mundo, transicao: Transicao, telaDoInventario: TelaDoInventario, artesanato: Artesanato) {
    this.mundo = mundo;
    this.transicao = transicao;
    this.telaDoInventario = telaDoInventario;
    this.artesanato = artesanato;

    const r = mundo.mapa.areaEmPixels(PORTA_DA_CASA);
    desenharPorta(mundo.cena, r);
    mundo.interacao.registrar({ ...r, dica: () => 'Casa · E: entrar', acao: () => this.abrirMenu() });
  }

  private abrirMenu() {
    const { menu, construcoes, deposito } = this.mundo;
    menu.abrir('Casa do Tomás', () => [
      {
        texto: 'Dormir até de manhã',
        detalhe: `Acorda às ${HORA_ACORDAR}h com ${
          construcoes.tem('cama') ? 'toda a energia' : '80% da energia (a cama de madeira recupera tudo)'
        }. As plantas regadas continuam crescendo durante a noite.`,
        aoEscolher: () => {
          this.dormir();
          return 'fechar';
        },
      },
      ...(construcoes.tem('cozinha') ? [{ texto: 'Cozinhar', aoEscolher: () => this.artesanato.abrir('cozinha') }] : []),
      ...(construcoes.tem('deposito')
        ? [
            {
              texto: 'Abrir o depósito',
              aoEscolher: () => {
                this.telaDoInventario.abrir(deposito);
                return 'fechar' as const;
              },
            },
          ]
        : []),
      { texto: 'Melhorar a casa...', aoEscolher: () => this.abrirMelhorias() },
      { texto: 'Sair', aoEscolher: () => 'fechar' as const },
    ]);
  }

  private abrirMelhorias() {
    const { menu, construcoes, inventario, avisos } = this.mundo;
    menu.abrir('Melhorar a casa', () => [
      ...MELHORIAS.map((id) => {
        const { nome, descricao } = CONSTRUCOES[id];
        const feita = construcoes.tem(id);
        const falta = faltaPara(id, inventario);
        return {
          texto: feita ? `${nome} (pronta)` : `${nome} — ${textoDoCusto(id)}`,
          detalhe: feita ? descricao : `${descricao}${falta.length ? `\nFalta: ${falta.join(', ')}.` : ''}`,
          ativa: !feita && falta.length === 0,
          aoEscolher: () => avisos.mostrar(construir(id, construcoes, inventario).aviso),
        };
      }),
      { texto: 'Voltar', aoEscolher: () => this.abrirMenu() },
    ]);
  }

  private dormir() {
    const { relogio, energia, construcoes, avisos } = this.mundo;
    this.transicao.escurecerE(() => {
      relogio.avancarAte(HORA_ACORDAR);
      energia.acordar(construcoes.tem('cama') ? 1 : ENERGIA_AO_ACORDAR_NA_PALHA);
      avisos.mostrar(`Bom dia! Dia ${relogio.dia} · ${textoDaData(relogio.dia)}`);
    });
  }
}
