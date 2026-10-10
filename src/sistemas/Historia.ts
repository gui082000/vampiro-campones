import { ALDEOES, type DefinicaoDeAldeao } from '../dados/aldeoes';
import { EVENTOS, FINAIS, PAGINAS_DO_DIARIO, type IdFinal } from '../dados/historia';
import { nomeDoItem } from '../dados/itens';
import {
  finaisNaColina,
  paginasDisponiveis,
  proximoEvento,
  type ContextoDaHistoria,
} from '../estado/Historia';
import { somarSuspeita } from '../estado/Suspeita';
import type { Dialogo } from '../interface/Dialogo';
import type { FimDeJogo } from '../interface/FimDeJogo';
import type { Interiores } from './Interiores';
import { anotarPista, type Mundo } from './Mundo';
import { armazenamento } from './Salvar';

const CHAVE_DOS_FINAIS = 'sangue-na-terra:finais'; // finais descobertos em todas as partidas
const COR_DO_NARRADOR = 0x2a2a3a;

export function finaisDescobertos(): IdFinal[] {
  try {
    return JSON.parse(armazenamento()?.getItem(CHAVE_DOS_FINAIS) ?? '[]');
  } catch {
    return [];
  }
}

// A história contada aos poucos: cenas curtas em dias marcados, as páginas dos diários do
// tio (lidas no porão), o Senhor da Colina no Ato 3 e os finais.
export class Historia {
  private mundo: Mundo;
  private dialogo: Dialogo;
  private fim: FimDeJogo;

  constructor(mundo: Mundo, interiores: Interiores, dialogo: Dialogo, fim: FimDeJogo) {
    this.mundo = mundo;
    this.dialogo = dialogo;
    this.fim = fim;

    interiores.definirUso('porao', 'estante', {
      dica: () => {
        const novas = paginasDisponiveis(mundo.relogio.dia) - mundo.historia.paginasLidas;
        return novas > 0 ? 'Diários do tio · E: ler uma página nova' : 'Diários do tio · nada novo por enquanto';
      },
      acao: () => this.lerPagina(),
    });
    interiores.definirUso('salaoDaColina', 'trono', {
      dica: () => 'O Senhor da Colina · E: encarar',
      acao: () => this.encararOSenhor(),
    });
  }

  private get contexto(): ContextoDaHistoria {
    const { relacoes, missoes, vampiro, inventario } = this.mundo;
    return { relacoes, missoes, vampiro, inventario };
  }

  // Dispara a próxima cena, quando nada estiver aberto na tela
  atualizar() {
    const { historia, relogio, controle } = this.mundo;
    if (!controle.livre || historia.final) return;
    const id = proximoEvento(historia, relogio.dia, relogio.hora, this.contexto);
    if (!id) return;
    historia.eventosVistos.push(id);
    const e = EVENTOS[id];
    const quem = e.quem === 'narrador' ? null : (ALDEOES[e.quem] as DefinicaoDeAldeao);
    this.dialogo.falar(quem?.nome ?? '', quem?.cor ?? COR_DO_NARRADOR, e.falas, () => this.aplicar(id));
  }

  private aplicar(id: string) {
    const e = EVENTOS[id];
    const { avisos, inventario, relacoes, suspeita } = this.mundo;
    if (e.pista) anotarPista(this.mundo, e.pista);
    if (e.item) {
      inventario.adicionar(e.item, 1);
      avisos.mostrar(`+1 ${nomeDoItem(e.item)}`);
    }
    if (e.desaparece && relacoes.vivo(e.desaparece)) relacoes.mortos.push(e.desaparece);
    if (e.suspeita) avisos.mostrar(somarSuspeita(suspeita, e.suspeita));
  }

  private lerPagina() {
    const { historia, relogio, avisos } = this.mundo;
    if (historia.paginasLidas >= paginasDisponiveis(relogio.dia)) {
      avisos.mostrar('As outras páginas estão grudadas pela umidade. Volte outro dia.');
      return;
    }
    const pagina = PAGINAS_DO_DIARIO[historia.paginasLidas++];
    this.dialogo.falar('Diário do tio', 0x5a4030, [pagina.texto], () => anotarPista(this.mundo, `Diário do tio: ${pagina.texto}`));
  }

  private encararOSenhor() {
    const { menu } = this.mundo;
    const textos: Record<IdFinal, string> = {
      redencao: 'Beber o elixir e quebrar o pacto',
      terraLimpa: 'Recusar, faminto, e deixar a colina morrer',
      guardiao: 'Ajoelhar e aceitar ser o novo guardião',
      senhorDaVila: 'Beber do próprio Senhor e tomar o lugar dele',
      fuga: '',
      linchado: '',
      fome: '',
    };
    this.dialogo.falar('O Senhor da Colina', 0x100010, [
      'Finalmente. O sangue do guardião, de pé diante de mim.',
      'A vila me deve. Seu tio tentou fugir da dívida. Você vai pagar, ou vai cobrar?',
    ], () =>
      menu.abrir('O que você faz?', () => [
        ...finaisNaColina(this.contexto).map((f) => ({
          texto: textos[f.id],
          detalhe: f.disponivel ? FINAIS[f.id].titulo : f.falta,
          ativa: f.disponivel,
          aoEscolher: () => {
            this.terminar(f.id);
            return 'fechar' as const;
          },
        })),
        { texto: 'Recuar (ainda não)', aoEscolher: () => 'fechar' as const },
      ]),
    );
  }

  // Encerra o jogo com um final e anota nos finais descobertos
  terminar(id: IdFinal) {
    const { historia, diario } = this.mundo;
    if (historia.final) return;
    historia.final = id;
    const titulo = FINAIS[id].titulo;
    if (!diario.finais.includes(titulo)) diario.finais.push(titulo);
    const a = armazenamento();
    const todos = finaisDescobertos();
    if (a && !todos.includes(id)) a.setItem(CHAVE_DOS_FINAIS, JSON.stringify([...todos, id]));
    this.fim.mostrar(titulo, FINAIS[id].texto);
  }
}
