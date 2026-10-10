import { textoDaData } from '../estado/Calendario';
import { aplicarSave, gravar, ler, montarSave, type Partes, type Save } from '../estado/Salvamento';
import type { Coleta } from './Coleta';
import type { Fazenda } from './Fazenda';
import type { Interiores } from './Interiores';
import type { Jogador } from './Jogador';
import type { Mundo } from './Mundo';

// Armazenamento do navegador (pode não existir, ex.: modo privado)
export function armazenamento(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function existeSave(): boolean {
  const a = armazenamento();
  return !!a && ler(a) !== null;
}

export function lerSave(): Save | null {
  const a = armazenamento();
  return a ? ler(a) : null;
}

// Junta o estado do mundo nas partes que vão para o save
export function partesDoMundo(mundo: Mundo, extras?: Pick<Partes, 'canteiros' | 'recursos' | 'onde'>): Partes {
  return {
    relogio: mundo.relogio,
    inventario: mundo.inventario,
    energia: mundo.energia,
    construcoes: mundo.construcoes,
    criacao: mundo.criacao,
    deposito: mundo.deposito,
    cofre: mundo.cofre,
    relacoes: mundo.relacoes,
    missoes: mundo.missoes,
    diario: mundo.diario,
    vampiro: mundo.vampiro,
    suspeita: mundo.suspeita,
    historia: mundo.historia,
    canteiros: extras?.canteiros ?? {},
    recursos: extras?.recursos ?? [],
    onde: extras?.onde ?? { local: 'fora', coluna: 0, linha: 0, volta: { coluna: 0, linha: 0 }, salaDeVolta: 'fora' },
  };
}

// Aplica o estado simples do save antes de os sistemas existirem (eles desenham o que leem)
export function aplicarNoMundo(save: Save, mundo: Mundo) {
  aplicarSave(save, partesDoMundo(mundo));
}

// Salva o jogo: a cada manhã (sozinho) e pelo menu de pausa
export class Salvar {
  private mundo: Mundo;
  private fazenda: Fazenda;
  private coleta: Coleta;
  private interiores: Interiores;
  private jogador: Jogador;

  constructor(mundo: Mundo, fazenda: Fazenda, coleta: Coleta, interiores: Interiores, jogador: Jogador) {
    this.mundo = mundo;
    this.fazenda = fazenda;
    this.coleta = coleta;
    this.interiores = interiores;
    this.jogador = jogador;
    // Salva sozinho de manhã (depois de tudo o que acontece na virada do dia)
    mundo.relogio.ouvir('amanheceu', () => {
      if (!mundo.vampiro.sucumbiu && !mundo.suspeita.linchado) this.salvar('Jogo salvo (início do dia)');
    });
  }

  salvar(aviso = 'Jogo salvo'): boolean {
    const a = armazenamento();
    const { relogio } = this.mundo;
    const partes = partesDoMundo(this.mundo, {
      canteiros: this.fazenda.lavoura.canteiros,
      recursos: this.coleta.nos,
      onde: this.interiores.onde(this.jogador),
    });
    const ok = !!a && gravar(a, montarSave(partes, `Dia ${relogio.dia} · ${textoDaData(relogio.dia)} · ${relogio.horario}`));
    this.mundo.avisos.mostrar(ok ? aviso : 'Não foi possível salvar neste navegador');
    return ok;
  }

  // Depois que os sistemas existem: o que precisa redesenhar e onde o Tomás está
  restaurarDepois(save: Save) {
    this.fazenda.restaurar(save.canteiros as Partes['canteiros']);
    this.coleta.restaurar(save.recursos as Partes['recursos']);
    this.interiores.restaurar(save.onde as Partes['onde']);
  }
}
