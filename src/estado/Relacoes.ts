import { ALDEOES, type IdAldeao } from '../dados/aldeoes';
import { nomeDoItem, type IdItem } from '../dados/itens';
import type { Inventario } from './Inventario';
import { feito, nada, type Resultado } from './Resultado';

export const PONTOS_POR_CORACAO = 10;
const MAXIMO = 10 * PONTOS_POR_CORACAO;
const PONTOS = { conversa: 3, gosta: 10, normal: 4, odeia: -6 };

export interface RelacaoComAldeao {
  pontos: number; // 0 a 100 (10 pontos = 1 coração)
  conversouHoje: boolean;
  presenteHoje: boolean;
}

// Amizade com cada aldeão. Só dados simples, para poder salvar.
export class Relacoes {
  porAldeao = Object.fromEntries(
    (Object.keys(ALDEOES) as IdAldeao[]).map((id) => [id, { pontos: 0, conversouHoje: false, presenteHoje: false }]),
  ) as Record<IdAldeao, RelacaoComAldeao>;

  mortos: IdAldeao[] = []; // mortos pelo Tomás (ou, mais tarde, por outras causas)
  fracoNoDia: Partial<Record<IdAldeao, number>> = {}; // mordido sem morrer: acorda fraco

  vivo(id: IdAldeao): boolean {
    return !this.mortos.includes(id);
  }

  coracoes(id: IdAldeao): number {
    return Math.floor(this.porAldeao[id].pontos / PONTOS_POR_CORACAO);
  }

  somar(id: IdAldeao, pontos: number) {
    const r = this.porAldeao[id];
    r.pontos = Math.max(0, Math.min(MAXIMO, r.pontos + pontos));
  }

  novoDia() {
    for (const r of Object.values(this.porAldeao)) {
      r.conversouHoje = false;
      r.presenteHoje = false;
    }
  }
}

// O Tomás matou o aldeão: a vila inteira fica mais fria com ele (1 coração a menos)
export function registrarMorte(relacoes: Relacoes, id: IdAldeao) {
  if (!relacoes.vivo(id)) return;
  relacoes.mortos.push(id);
  for (const outro of Object.keys(ALDEOES) as IdAldeao[]) if (outro !== id) relacoes.somar(outro, -PONTOS_POR_CORACAO);
}

// O que o aldeão diz hoje: uma fala da faixa da amizade, que muda a cada dia.
// Conversar pela primeira vez no dia aumenta a amizade.
export function conversar(relacoes: Relacoes, id: IdAldeao, dia: number): string {
  const { falas } = ALDEOES[id];
  const faixa = Math.min(falas.length - 1, Math.floor(relacoes.coracoes(id) / 3));
  const opcoes = falas[faixa];
  const r = relacoes.porAldeao[id];
  if (!r.conversouHoje) {
    r.conversouHoje = true;
    relacoes.somar(id, PONTOS.conversa);
  }
  return opcoes[(dia + Object.keys(ALDEOES).indexOf(id)) % opcoes.length];
}

// Dá 1 do item da mão de presente (um por dia por aldeão)
export function presentear(relacoes: Relacoes, id: IdAldeao, inventario: Inventario): Resultado {
  const item = inventario.itemNaMao;
  const aldeao = ALDEOES[id];
  if (!item) return nada('Segure na mão o que quer dar (teclas 1 a 8)');
  if (relacoes.porAldeao[id].presenteHoje) return nada(`Você já deu um presente para ${aldeao.nome} hoje`);
  inventario.gastarDaMao();
  relacoes.porAldeao[id].presenteHoje = true;
  const gosta = (aldeao.gosta as IdItem[]).includes(item);
  const odeia = (aldeao.odeia as IdItem[]).includes(item);
  relacoes.somar(id, gosta ? PONTOS.gosta : odeia ? PONTOS.odeia : PONTOS.normal);
  const reacao = gosta ? 'adorou' : odeia ? 'não gostou nada de' : 'agradeceu por';
  return feito(`${aldeao.nome} ${reacao} ${nomeDoItem(item).toLowerCase()}`);
}
