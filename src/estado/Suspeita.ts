import { SUSPEITA } from '../config';
import { ALDEOES, type IdAldeao } from '../dados/aldeoes';

// Faixas da suspeita: cada uma muda o comportamento da vila
export const FAIXAS = [
  { minimo: 0, nome: 'Calma', descricao: 'A vila vive normalmente.' },
  { minimo: 20, nome: 'Boatos', descricao: 'Fala-se de sumiços e de lobo na taverna.' },
  { minimo: 40, nome: 'Desconfiança', descricao: 'Preços mais altos; quem não gosta de você nem fala com você.' },
  { minimo: 60, nome: 'Investigação', descricao: 'Orlando faz rondas à noite; o padre prega contra a noite.' },
  { minimo: 80, nome: 'Caça aberta', descricao: 'Portas trancadas à noite e armadilhas pelos caminhos.' },
] as const;

export type NomeDaFaixa = (typeof FAIXAS)[number]['nome'];

export interface Corpo {
  sala: string; // 'fora' ou o id da sala
  coluna: number;
  linha: number;
  quem: string;
}

// O quanto a vila desconfia do Tomás. Só dados simples, para poder salvar.
export class Suspeita {
  valor = 0;
  lidos = 0; // quantas entradas do registro noturno já foram contadas
  corpos: Corpo[] = []; // ainda não escondidos
  carregando: Corpo | null = null; // o corpo que o Tomás está carregando
  culpouOLoboNoDia = 0;
  linchado = false;
}

export function faixa(s: Suspeita): (typeof FAIXAS)[number] {
  let atual: (typeof FAIXAS)[number] = FAIXAS[0];
  for (const f of FAIXAS) if (s.valor >= f.minimo) atual = f;
  return atual;
}

export function nivel(s: Suspeita): number {
  return FAIXAS.indexOf(faixa(s));
}

// Soma (ou tira) suspeita. Devolve o aviso se mudou de faixa.
export function somarSuspeita(s: Suspeita, pontos: number): string | undefined {
  const antes = nivel(s);
  s.valor = Math.max(0, Math.min(100, s.valor + pontos));
  if (s.valor >= 100) s.linchado = true;
  const depois = nivel(s);
  if (depois > antes) return `A vila está mais desconfiada: ${FAIXAS[depois].nome}. ${FAIXAS[depois].descricao}`;
  if (depois < antes) return `A vila se acalma: ${FAIXAS[depois].nome}.`;
  return undefined;
}

function nomeDe(quem: string): string {
  return quem in ALDEOES ? ALDEOES[quem as IdAldeao].nome : 'um viajante';
}

// Lê o que o Tomás fez à noite (registro do vampiro) e transforma em suspeita.
// Devolve os avisos para mostrar.
export function lerRegistro(s: Suspeita, registro: string[]): string[] {
  const avisos: string[] = [];
  for (; s.lidos < registro.length; s.lidos++) {
    const [tipo, quem] = registro[s.lidos].split(':');
    let pontos = 0;
    if (tipo === 'desaparecido') pontos = quem === 'viajante' ? SUSPEITA.viajanteDesaparecido : SUSPEITA.aldeaoDesaparecido;
    else if (tipo === 'testemunha') pontos = SUSPEITA.vitimaLembra;
    else if (tipo === 'visto') {
      pontos = SUSPEITA.vistoMordendo;
      avisos.push(`${nomeDe(quem)} viu você morder!`);
    } else if (tipo === 'sinal') pontos = SUSPEITA.sinalNotado;
    const aviso = somarSuspeita(s, pontos);
    if (aviso) avisos.push(aviso);
  }
  return avisos;
}

// Novo dia: a vila esquece um pouco; corpos não escondidos são encontrados
export function passarDiaDaSuspeita(s: Suspeita): string[] {
  const avisos: string[] = [];
  for (const corpo of s.corpos) {
    avisos.push(`Encontraram o corpo de ${corpo.quem}. A vila está em choque.`);
    const aviso = somarSuspeita(s, SUSPEITA.corpoEncontrado);
    if (aviso) avisos.push(aviso);
  }
  s.corpos = [];
  const aviso = somarSuspeita(s, -SUSPEITA.quedaPorDia);
  if (aviso) avisos.push(aviso);
  return avisos;
}
