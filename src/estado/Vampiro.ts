import {
  DIAS_NO_LIMITE_PARA_SUCUMBIR,
  ENERGIA_POR_HORA_NO_SOL,
  FOME_POR_HORA_DE_DIA,
  FOME_POR_HORA_DE_NOITE,
  QUEIMADURA_DO_AMANHECER,
  SOL_FORTE,
} from '../config';
import { nomeDoItem, type IdItem } from '../dados/itens';
import { ALIMENTOS, PODERES, SINAIS, type Alimento, type Poder } from '../dados/vampiro';
import type { Energia } from './Energia';
import type { Inventario } from './Inventario';
import { feito, nada, type Resultado } from './Resultado';

// A vida noturna do Tomás. Só dados simples, para poder salvar e testar.
export class Vampiro {
  fome = 20;
  essencia = 0;
  poderes: Poder[] = [];
  jaMordeu = false; // a primeira mordida libera as receitas do vampiro
  diasNoLimite = 0; // dias inteiros terminados com fome 100
  disfarcadoNoDia = 0; // ervas de disfarce: esconde os sinais nesse dia
  protegidoDoSolNoDia = 0; // unguento: o sol não cansa nesse dia
  sucumbiu = false;
  registro: string[] = []; // o que ele fez à noite (a suspeita da Fase 5 vai ler daqui)

  tem(poder: Poder): boolean {
    return this.poderes.includes(poder);
  }
}

// Sinal mais forte que aparece agora (ou null)
export function sinalVisivel(v: Vampiro, dia: number): string | null {
  if (v.disfarcadoNoDia === dia) return null;
  let sinal: string | null = null;
  for (const s of SINAIS) if (v.fome >= s.fome) sinal = s.nome;
  return sinal;
}

// O tempo passa: a fome sobe (mais rápido à noite). De dia, no sol forte e fora de
// casa, com fome, a maldição cansa o corpo.
export function passarTempo(v: Vampiro, horas: number, eNoite: boolean, ctx: { hora: number; dia: number; foraDeCasa: boolean; energia: Energia }) {
  v.fome = Math.min(100, v.fome + horas * (eNoite ? FOME_POR_HORA_DE_NOITE : FOME_POR_HORA_DE_DIA));
  const [inicio, fim] = SOL_FORTE;
  const noSol = !eNoite && ctx.foraDeCasa && ctx.hora >= inicio && ctx.hora < fim;
  if (noSol && v.fome >= 50 && v.protegidoDoSolNoDia !== ctx.dia) {
    ctx.energia.atual = Math.max(0, ctx.energia.atual - horas * ENERGIA_POR_HORA_NO_SOL);
  }
}

// Fim do dia (6h): conta os dias com fome no limite. Devolve true se sucumbiu.
export function fecharDia(v: Vampiro): boolean {
  v.diasNoLimite = v.fome >= 100 ? v.diasNoLimite + 1 : 0;
  if (v.diasNoLimite >= DIAS_NO_LIMITE_PARA_SUCUMBIR) v.sucumbiu = true;
  return v.sucumbiu;
}

// Pego pelo sol fora do esconderijo
export function queimarNoAmanhecer(v: Vampiro, energia: Energia): Resultado {
  energia.atual = Math.max(0, energia.atual - QUEIMADURA_DO_AMANHECER.energia);
  v.fome = Math.min(100, v.fome + QUEIMADURA_DO_AMANHECER.fome);
  return feito('O sol nasceu e queimou sua pele! Volte para casa antes do amanhecer.');
}

export function beber(v: Vampiro, alimento: Alimento, quem: string): Resultado {
  const a = ALIMENTOS[alimento];
  v.fome = Math.max(0, v.fome - a.fome);
  v.essencia += a.essencia;
  v.registro.push(`${alimento}:${quem}`);
  const primeira = !v.jaMordeu;
  v.jaMordeu = true;
  return feito(`Você bebeu de ${quem}. Fome -${a.fome}, essência +${a.essencia}${primeira ? '. Algumas receitas da bancada agora fazem sentido.' : ''}`);
}

export function comprarPoder(v: Vampiro, poder: Poder): Resultado {
  const p = PODERES[poder];
  if (v.tem(poder)) return nada(`Você já tem ${p.nome.toLowerCase()}`);
  if (v.essencia < p.custo) return nada(`${p.nome} precisa de ${p.custo} de essência`);
  v.essencia -= p.custo;
  v.poderes.push(poder);
  return feito(`Novo poder: ${p.nome}`);
}

// Usa um item do vampiro da mão (tecla F)
export function usarItemDoVampiro(v: Vampiro, inventario: Inventario, dia: number): Resultado {
  const item = inventario.itemNaMao as IdItem | null;
  if (item === 'unguentoSolar') v.protegidoDoSolNoDia = dia;
  else if (item === 'ervasDeDisfarce') v.disfarcadoNoDia = dia;
  else if (item === 'tonicoRubro') v.fome = Math.max(0, v.fome - 20);
  else return nada();
  inventario.gastarDaMao();
  const efeito = { unguentoSolar: 'o sol não vai te cansar hoje', ervasDeDisfarce: 'ninguém vai notar seus sinais hoje', tonicoRubro: 'fome -20' }[item];
  return feito(`Usou ${nomeDoItem(item).toLowerCase()}: ${efeito}`);
}
