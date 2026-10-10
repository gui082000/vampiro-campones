import { ENERGIA_AO_ACORDAR_NA_PALHA, HORA_ACORDAR, HORA_ANOITECER } from '../config';
import { CONSTRUCOES, type IdConstrucao } from '../dados/construcoes';
import { PODERES, type Poder } from '../dados/vampiro';
import { textoDaData } from '../estado/Calendario';
import { construir, faltaPara, textoDoCusto } from '../estado/Construcoes';
import { comprarPoder } from '../estado/Vampiro';
import type { TelaDoInventario } from '../interface/TelaDoInventario';
import type { Transicao } from '../interface/Transicao';
import type { Artesanato } from './Artesanato';
import type { Interiores } from './Interiores';
import { anotarPista, type Mundo } from './Mundo';

const MELHORIAS: IdConstrucao[] = ['cama', 'cozinha', 'deposito', 'porao'];

// A casa do Tomás por dentro: a cama (dormir), a mesa (melhorias), o fogão (cozinhar),
// o baú (depósito) e o alçapão do porão. Reformado, o porão é o esconderijo: caixão
// (dormir de dia até o anoitecer), cofre e o altar onde a essência vira poderes.
export class Casa {
  private mundo: Mundo;
  private transicao: Transicao;

  constructor(mundo: Mundo, interiores: Interiores, transicao: Transicao, telaDoInventario: TelaDoInventario, artesanato: Artesanato) {
    this.mundo = mundo;
    this.transicao = transicao;
    const { construcoes, deposito, cofre, avisos } = mundo;

    interiores.definirUso('casaDoTomas', 'cama', {
      dica: () => (construcoes.tem('cama') ? 'Cama de madeira · E: dormir' : 'Cama de palha · E: dormir'),
      acao: () => this.perguntarSeDorme(false),
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
      dica: () => (construcoes.tem('porao') ? 'Alçapão · E: descer ao porão' : 'Alçapão do porão · trancado'),
      acao: () => {
        if (construcoes.tem('porao')) {
          const aqui = interiores.celulaNaSala('casaDoTomas', 7, 3);
          interiores.entrar('porao', aqui, 'casaDoTomas');
          return;
        }
        const texto = 'O alçapão do porão está trancado com correntes, pelo lado de baixo. Lá dentro, algo arranha a madeira.';
        avisos.mostrar(texto);
        anotarPista(mundo, texto);
      },
    });

    interiores.definirUso('porao', 'caixao', {
      dica: () => 'Caixão · E: dormir',
      acao: () => this.perguntarSeDorme(true),
    });
    interiores.definirUso('porao', 'cofre', {
      dica: () => 'Cofre · E: abrir',
      acao: () => telaDoInventario.abrir(cofre),
    });
    interiores.definirUso('porao', 'altarDeSangue', {
      dica: () => `Altar · essência: ${mundo.vampiro.essencia} · E: despertar poderes`,
      acao: () => this.abrirAltar(),
    });
  }

  private perguntarSeDorme(noCaixao: boolean) {
    const { menu, construcoes } = this.mundo;
    const energia = noCaixao || construcoes.tem('cama') ? 'toda a energia' : '80% da energia (a cama de madeira recupera tudo)';
    menu.abrir(noCaixao ? 'Deitar no caixão?' : 'Dormir até de manhã?', () => [
      {
        texto: `Dormir até as ${HORA_ACORDAR}h`,
        detalhe: `Acorda com ${energia}. As plantas regadas continuam crescendo enquanto você dorme.`,
        aoEscolher: () => {
          this.dormir(HORA_ACORDAR, noCaixao);
          return 'fechar' as const;
        },
      },
      ...(noCaixao
        ? [
            {
              texto: `Dormir até o anoitecer (${HORA_ANOITECER}h)`,
              detalhe: 'Passa o dia escondido do sol. Acorda pronto para a noite.',
              aoEscolher: () => {
                this.dormir(HORA_ANOITECER, true);
                return 'fechar' as const;
              },
            },
          ]
        : []),
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
          texto: feita ? `${nome} (pronto)` : `${nome} — ${textoDoCusto(id)}`,
          detalhe: feita ? descricao : `${descricao}${falta.length ? `\nFalta: ${falta.join(', ')}.` : ''}`,
          ativa: !feita && falta.length === 0,
          aoEscolher: () => avisos.mostrar(construir(id, construcoes, inventario).aviso),
        };
      }),
      { texto: 'Fechar', aoEscolher: () => 'fechar' as const },
    ]);
  }

  private abrirAltar() {
    const { menu, vampiro, avisos } = this.mundo;
    menu.abrir(
      () => `Altar · essência: ${vampiro.essencia}`,
      () => [
        ...(Object.keys(PODERES) as Poder[]).map((poder) => {
          const p = PODERES[poder];
          return {
            texto: vampiro.tem(poder) ? `${p.nome} (desperto)` : `${p.nome} — ${p.custo} de essência`,
            detalhe: p.descricao,
            ativa: !vampiro.tem(poder) && vampiro.essencia >= p.custo,
            aoEscolher: () => avisos.mostrar(comprarPoder(vampiro, poder).aviso),
          };
        }),
        { texto: 'Fechar', aoEscolher: () => 'fechar' as const },
      ],
    );
  }

  private dormir(ate: number, noCaixao: boolean) {
    const { relogio, energia, construcoes, avisos } = this.mundo;
    this.transicao.escurecerE(() => {
      relogio.avancarAte(ate);
      energia.acordar(noCaixao || construcoes.tem('cama') ? 1 : ENERGIA_AO_ACORDAR_NA_PALHA);
      avisos.mostrar(ate === HORA_ANOITECER ? 'Você desperta. A noite chegou.' : `Bom dia! Dia ${relogio.dia} · ${textoDaData(relogio.dia)}`);
    });
  }
}
