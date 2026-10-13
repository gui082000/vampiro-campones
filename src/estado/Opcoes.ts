import type { Armazenamento } from './Salvamento';

const CHAVE = 'sangue-na-terra:opcoes';

// Preferências do jogador (valem para todos os saves)
export interface Opcoes {
  telaCheia: boolean;
  mostrarAjuda: boolean; // as teclas no canto da tela
  volume: number; // 0 a 100
}

export const OPCOES_PADRAO: Opcoes = { telaCheia: false, mostrarAjuda: true, volume: 80 };

export function lerOpcoes(armazenamento: Armazenamento): Opcoes {
  try {
    return { ...OPCOES_PADRAO, ...JSON.parse(armazenamento.getItem(CHAVE) ?? '{}') };
  } catch {
    return { ...OPCOES_PADRAO };
  }
}

export function gravarOpcoes(armazenamento: Armazenamento, opcoes: Opcoes) {
  try {
    armazenamento.setItem(CHAVE, JSON.stringify(opcoes));
  } catch {
    // sem armazenamento (ex.: navegador em modo privado): as opções valem só até fechar
  }
}
