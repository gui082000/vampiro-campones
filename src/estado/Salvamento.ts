import type { Construcoes } from './Construcoes';
import type { Criacao } from './Criacao';
import type { Diario } from './Diario';
import type { Energia } from './Energia';
import type { Inventario } from './Inventario';
import type { Missoes } from './Missoes';
import type { Canteiro } from './Plantacao';
import type { Recipiente } from './Recipiente';
import type { NoDeRecurso } from './Recursos';
import type { Relacoes } from './Relacoes';
import type { Suspeita } from './Suspeita';
import type { Vampiro } from './Vampiro';

export const CHAVE_DO_SAVE = 'sangue-na-terra:save';
export const VERSAO_DO_SAVE = 1;

// Tudo o que o jogo guarda num save
export interface Partes {
  relogio: { hora: number; dia: number };
  inventario: Inventario;
  energia: Energia;
  construcoes: Construcoes;
  criacao: Criacao;
  deposito: Recipiente;
  cofre: Recipiente;
  relacoes: Relacoes;
  missoes: Missoes;
  diario: Diario;
  vampiro: Vampiro;
  suspeita: Suspeita;
  canteiros: Record<string, Canteiro>;
  recursos: NoDeRecurso[];
  onde: { local: string; coluna: number; linha: number; volta: { coluna: number; linha: number }; salaDeVolta: string };
}

export interface Save extends Record<keyof Partes, unknown> {
  versao: number;
  salvoEm: string; // ex.: "Dia 3 · 3 de Primavera · 14:20"
}

const copiar = <T>(x: T): T => JSON.parse(JSON.stringify(x));

// Fotografa o estado do jogo (só dados simples, prontos para virar texto)
export function montarSave(partes: Partes, salvoEm: string): Save {
  const save = { versao: VERSAO_DO_SAVE, salvoEm } as Save;
  for (const chave of Object.keys(partes) as (keyof Partes)[]) save[chave] = copiar(partes[chave]);
  save.relogio = { hora: partes.relogio.hora, dia: partes.relogio.dia };
  return save;
}

// Copia os dados do save para dentro dos objetos de estado já criados
export function aplicarSave(save: Save, partes: Partes) {
  if (save.versao !== VERSAO_DO_SAVE) throw new Error('Save de outra versão do jogo');
  for (const chave of Object.keys(partes) as (keyof Partes)[]) {
    const dados = save[chave];
    if (dados === undefined) continue;
    if (chave === 'canteiros' || chave === 'recursos') continue; // aplicados pelos sistemas (precisam redesenhar)
    if (chave === 'relogio') {
      // só a hora e o dia: o relógio de verdade tem também quem escuta seus avisos
      const { hora, dia } = dados as Partes['relogio'];
      Object.assign(partes.relogio, { hora, dia });
      continue;
    }
    Object.assign(partes[chave] as object, copiar(dados));
  }
  // O corpo carregado é um dos corpos da lista: reconecta (o texto perde essa ligação)
  const s = partes.suspeita;
  if (s.carregando) {
    const igual = s.corpos.find((c) => JSON.stringify(c) === JSON.stringify(s.carregando));
    s.carregando = igual ?? null;
  }
}

// Leitura e escrita num armazenamento (localStorage no jogo; um falso nos testes)
export interface Armazenamento {
  getItem(chave: string): string | null;
  setItem(chave: string, valor: string): void;
}

export function gravar(armazenamento: Armazenamento, save: Save): boolean {
  try {
    armazenamento.setItem(CHAVE_DO_SAVE, JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}

export function ler(armazenamento: Armazenamento): Save | null {
  try {
    const texto = armazenamento.getItem(CHAVE_DO_SAVE);
    if (!texto) return null;
    const save = JSON.parse(texto) as Save;
    return save.versao === VERSAO_DO_SAVE ? save : null;
  } catch {
    return null;
  }
}
