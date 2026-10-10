import { ATOS, EVENTOS, FINAIS, PAGINAS_DO_DIARIO, PODER_PARA_DOMINAR, type IdFinal } from '../dados/historia';
import type { Inventario } from './Inventario';
import type { Missoes } from './Missoes';
import type { Relacoes } from './Relacoes';
import type { Vampiro } from './Vampiro';

// O andamento da história. Só dados simples, para poder salvar.
export class Historia {
  eventosVistos: string[] = [];
  paginasLidas = 0;
  final: IdFinal | null = null;
}

export function atoDoDia(dia: number): (typeof ATOS)[number] {
  let atual = ATOS[0];
  for (const a of ATOS) if (dia >= a.diaInicial) atual = a;
  return atual;
}

export interface ContextoDaHistoria {
  relacoes: Relacoes;
  missoes: Missoes;
  vampiro: Vampiro;
  inventario: Inventario;
}

// A Helena só se abre com quem ela confia
export function helenaConfia(ctx: ContextoDaHistoria): boolean {
  return ctx.relacoes.vivo('helena') && ctx.relacoes.coracoes('helena') >= 3;
}

// O próximo evento que já deveria ter acontecido (ou null)
export function proximoEvento(h: Historia, dia: number, hora: number, ctx: ContextoDaHistoria): string | null {
  for (const [id, e] of Object.entries(EVENTOS)) {
    if (h.eventosVistos.includes(id)) continue;
    const chegou = dia > e.dia || (dia === e.dia && hora >= e.hora);
    if (!chegou) continue;
    if (e.so === 'helenaConfia' && !helenaConfia(ctx)) continue;
    if (e.quem !== 'narrador' && !ctx.relacoes.vivo(e.quem)) continue;
    return id;
  }
  return null;
}

// Páginas dos diários do tio que já dá para ler
export function paginasDisponiveis(dia: number): number {
  return PAGINAS_DO_DIARIO.filter((p) => dia >= p.dia).length;
}

// Matou gente? (o registro do vampiro guarda tudo)
export function mortesHumanas(v: Vampiro): number {
  return v.registro.filter((r) => r.startsWith('aldeaoFim') || r.startsWith('viajanteFim')).length;
}

export function bebeuDeGente(v: Vampiro): boolean {
  return v.registro.some((r) => r.startsWith('aldeao') || r.startsWith('viajante'));
}

// Os finais que o Tomás pode escolher diante do Senhor da Colina, com o que falta em cada um
export function finaisNaColina(ctx: ContextoDaHistoria): { id: IdFinal; disponivel: boolean; falta: string }[] {
  const mortes = mortesHumanas(ctx.vampiro);
  const aldeoesMortos = ctx.relacoes.mortos.length;
  return [
    {
      id: 'redencao',
      disponivel: ctx.inventario.tem('elixirDaAurora') && mortes === 0,
      falta: !ctx.inventario.tem('elixirDaAurora') ? 'Precisa do elixir da Helena.' : 'O elixir não funciona em quem tirou uma vida.',
    },
    {
      id: 'terraLimpa',
      disponivel: !bebeuDeGente(ctx.vampiro),
      falta: 'Só para quem nunca bebeu de gente.',
    },
    { id: 'guardiao', disponivel: true, falta: '' },
    {
      id: 'senhorDaVila',
      disponivel: ctx.vampiro.essencia >= PODER_PARA_DOMINAR.essencia && aldeoesMortos >= PODER_PARA_DOMINAR.mortes,
      falta: `Precisa de ${PODER_PARA_DOMINAR.essencia} de essência e de ter matado ${PODER_PARA_DOMINAR.mortes} aldeões.`,
    },
  ];
}

export function tituloDoFinal(id: IdFinal): string {
  return FINAIS[id].titulo;
}
