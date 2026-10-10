import type { Estacao } from '../dados/estacoes';
import { nomeDoItem } from '../dados/itens';
import { RECURSOS, definicaoDoRecurso, type TipoDeRecurso } from '../dados/recursos';
import { inteiroEntre } from '../util/aleatorio';
import { contem, type AreaDeCelulas } from '../util/areas';
import type { Energia } from './Energia';
import type { Inventario } from './Inventario';
import { SEM_ENERGIA, feito, nada, type Resultado } from './Resultado';

// Uma árvore, pedra, moita... num ponto fixo do mapa. Só dados simples.
export interface NoDeRecurso {
  tipo: TipoDeRecurso;
  coluna: number;
  linha: number;
  golpes: number; // usos que faltam para soltar os itens
  diasParaVoltar: number; // 0 = está lá (ou, no arbusto, com frutos)
}

export interface ContextoDaColeta {
  inventario: Inventario;
  energia: Energia;
  estacao: Estacao;
  aleatorio: () => number;
}

function naEstacao(tipo: TipoDeRecurso, estacao: Estacao): boolean {
  const { estacoes } = definicaoDoRecurso(tipo);
  return !estacoes || estacoes.includes(estacao);
}

// Se está no mapa (aparece e pode bloquear a passagem)
export function estaPresente(n: NoDeRecurso, estacao: Estacao): boolean {
  if (definicaoDoRecurso(n.tipo).permanente) return true;
  return n.diasParaVoltar === 0 && naEstacao(n.tipo, estacao);
}

// Se dá para colher agora (o arbusto fica no lugar, mas só tem frutos às vezes)
export function temColheita(n: NoDeRecurso, estacao: Estacao): boolean {
  return n.diasParaVoltar === 0 && naEstacao(n.tipo, estacao);
}

// Usa o item da mão no recurso (tecla E)
export function usarNoRecurso(n: NoDeRecurso, ctx: ContextoDaColeta): Resultado {
  const recurso = definicaoDoRecurso(n.tipo);
  if (!temColheita(n, ctx.estacao)) return nada(recurso.permanente ? 'Sem frutos agora' : undefined);
  if (recurso.ferramenta && ctx.inventario.itemNaMao !== recurso.ferramenta) {
    return nada(`Precisa de ${nomeDoItem(recurso.ferramenta).toLowerCase()}`);
  }

  const ultimoGolpe = n.golpes <= 1;
  if (ultimoGolpe && recurso.solta.some((s) => ctx.inventario.espacoPara(s.item) < s.max)) {
    return nada('Inventário cheio');
  }
  if (!ctx.energia.gastar(recurso.energia)) return nada(SEM_ENERGIA);

  n.golpes -= 1;
  if (!ultimoGolpe) return feito();

  const ganhos: string[] = [];
  for (const s of recurso.solta) {
    const qtd = inteiroEntre(ctx.aleatorio, s.min, s.max);
    if (qtd === 0) continue;
    ctx.inventario.adicionar(s.item, qtd);
    ganhos.push(`+${qtd} ${nomeDoItem(s.item)}`);
  }
  n.golpes = recurso.golpes;
  n.diasParaVoltar = recurso.diasParaVoltar;
  return feito(ganhos.join('  '));
}

export function dicaDoRecurso(n: NoDeRecurso, ctx: ContextoDaColeta): string {
  const recurso = definicaoDoRecurso(n.tipo);
  if (!temColheita(n, ctx.estacao)) return `${recurso.nome} · sem frutos agora`;
  if (recurso.ferramenta && ctx.inventario.itemNaMao !== recurso.ferramenta) {
    return `${recurso.nome} · use ${nomeDoItem(recurso.ferramenta).toLowerCase()}`;
  }
  const verbo = n.tipo === 'arvore' ? 'cortar' : n.tipo === 'pedra' ? 'quebrar' : n.tipo === 'mato' ? 'arrancar' : 'colher';
  return `E: ${verbo} ${recurso.nome.toLowerCase()}`;
}

// Novo dia: o que foi colhido vai voltando
export function passarDiaDoRecurso(n: NoDeRecurso) {
  if (n.diasParaVoltar > 0) n.diasParaVoltar -= 1;
}

// Espalha os recursos pelas áreas, sempre nas mesmas células para a mesma semente.
// `livre` diz se a célula pode receber algo (não é parede, água, plantação...).
// Dois recursos nunca ficam colados (nem na diagonal).
export function espalharRecursos(
  areas: { tipo: TipoDeRecurso; quantidade: number; area: AreaDeCelulas }[],
  livre: (coluna: number, linha: number) => boolean,
  aleatorio: () => number,
): NoDeRecurso[] {
  const nos: NoDeRecurso[] = [];
  const colado = (coluna: number, linha: number) =>
    nos.some((n) => Math.abs(n.coluna - coluna) <= 1 && Math.abs(n.linha - linha) <= 1);

  for (const { tipo, quantidade, area } of areas) {
    let colocados = 0;
    for (let tentativa = 0; tentativa < quantidade * 30 && colocados < quantidade; tentativa++) {
      const coluna = area.coluna + Math.floor(aleatorio() * area.colunas);
      const linha = area.linha + Math.floor(aleatorio() * area.linhas);
      if (!contem(area, coluna, linha) || !livre(coluna, linha) || colado(coluna, linha)) continue;
      nos.push({ tipo, coluna, linha, golpes: RECURSOS[tipo].golpes, diasParaVoltar: 0 });
      colocados++;
    }
  }
  return nos;
}
