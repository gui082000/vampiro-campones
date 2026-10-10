import { ENERGIA_AO_ACORDAR_NA_PALHA, HORA_ACORDAR } from '../config';
import { CONSTRUCOES, type IdConstrucao } from '../dados/construcoes';
import { textoDaData } from '../estado/Calendario';
import { construir, faltaPara, textoDoCusto } from '../estado/Construcoes';
import type { TelaDoInventario } from '../interface/TelaDoInventario';
import type { Transicao } from '../interface/Transicao';
import type { Artesanato } from './Artesanato';
import type { Interiores } from './Interiores';
import { anotarPista, type Mundo } from './Mundo';

const MELHORIAS: IdConstrucao[] = ['cama', 'cozinha', 'deposito'];

// A casa do Tomás por dentro: a cama (dormir), a mesa (melhorias), o fogão (cozinhar,
// depois de construir a cozinha), o baú (depósito) e o alçapão do porão, trancado.
export class Casa {
  private mundo: Mundo;
  private transicao: Transicao;

  constructor(mundo: Mundo, interiores: Interiores, transicao: Transicao, telaDoInventario: TelaDoInventario, artesanato: Artesanato) {
    this.mundo = mundo;
    this.transicao = transicao;
    const { construcoes, deposito, avisos } = mundo;

    interiores.definirUso('casaDoTomas', 'cama', {
      dica: () => (construcoes.tem('cama') ? 'Cama de madeira · E: dormir' : 'Cama de palha · E: dormir'),
      acao: () => this.perguntarSeDorme(),
    });
    interiores.definirUso('casaDoTomas', 'mesa', {
      dica: () => 'Mesa · E: planejar melhorias',
      acao: () => this.abrirMelhorias(),
    });
    interiores.definirUso('casaDoTomas', 'fogao', {
      dica: () => (construcoes.tem('cozinha') ? 'Fogão · E: cozinhar' : 'Canto da cozinha · construa a cozinha (mesa)'),
      acao: () => (construcoes.tem('cozinha') ? artesanato.abrir('cozinha') : avisos.mostrar('Ainda não há cozinha. Planeje na mesa.')),
    });
    interiores.definirUso('casaDoTomas', 'bau', {
      dica: () => (construcoes.tem('deposito') ? 'Baú · E: abrir o depósito' : 'Lugar do baú · construa o depósito (mesa)'),
      acao: () => (construcoes.tem('deposito') ? telaDoInventario.abrir(deposito) : avisos.mostrar('Ainda não há baú. Planeje na mesa.')),
    });
    interiores.definirUso('casaDoTomas', 'alcapao', {
      dica: () => 'Alçapão do porão · trancado',
      acao: () => {
        const texto = 'O alçapão do porão está trancado com correntes, pelo lado de baixo. Lá dentro, algo arranha a madeira.';
        avisos.mostrar(texto);
        anotarPista(mundo, texto);
      },
    });
  }

  private perguntarSeDorme() {
    const { menu, construcoes } = this.mundo;
    menu.abrir('Dormir até de manhã?', () => [
      {
        texto: 'Dormir',
        detalhe: `Acorda às ${HORA_ACORDAR}h com ${
          construcoes.tem('cama') ? 'toda a energia' : '80% da energia (a cama de madeira recupera tudo)'
        }. As plantas regadas continuam crescendo durante a noite.`,
        aoEscolher: () => {
          this.dormir();
          return 'fechar' as const;
        },
      },
      { texto: 'Ainda não', aoEscolher: () => 'fechar' as const },
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
      { texto: 'Fechar', aoEscolher: () => 'fechar' as const },
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
