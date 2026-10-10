import { aparenciaDoCanteiro, criarCanteiro, desenharCanteiro, type VisualCanteiro } from '../arte/Objetos';
import { AREAS_DE_PLANTIO } from '../dados/mundo';
import { estacaoDoDia } from '../estado/Calendario';
import {
  Lavoura,
  crescer,
  dicaDoCanteiro,
  mudarDeEstacao,
  novoCanteiro,
  secar,
  usarNoCanteiro,
  type Canteiro,
  type ContextoDaFazenda,
} from '../estado/Plantacao';
import { dentroDeAlguma } from '../util/areas';
import { quantidade } from '../util/texto';
import type { Interagivel } from './Interacao';
import { TAMANHO_CELULA } from './Mapa';
import type { Mundo } from './Mundo';

// O campo de plantio: qualquer célula das áreas de plantio pode ser arada, regada,
// plantada e colhida (as regras ficam em estado/Plantacao). As plantas crescem com o
// tempo que passa no relógio, e a terra seca a cada novo dia.
export class Fazenda {
  readonly lavoura = new Lavoura();

  private mundo: Mundo;
  private visuais = new Map<string, { visual: VisualCanteiro; aparencia: string }>();
  private alvos = new Map<string, Interagivel>();

  constructor(mundo: Mundo) {
    this.mundo = mundo;
    mundo.interacao.registrarProvedor((coluna, linha) => this.alvoEm(coluna, linha));
    mundo.relogio.ouvir('passou', (horas, eNoite) => this.crescer(horas, eNoite));
    mundo.relogio.ouvir('novo-dia', (dia) => this.novoDia(dia));
  }

  private get contexto(): ContextoDaFazenda {
    return { inventario: this.mundo.inventario, energia: this.mundo.energia, estacao: this.mundo.relogio.estacao };
  }

  private alvoEm(coluna: number, linha: number): Interagivel | null {
    if (!dentroDeAlguma(AREAS_DE_PLANTIO, coluna, linha)) return null;
    const chave = `${coluna},${linha}`;
    let alvo = this.alvos.get(chave);
    if (!alvo) {
      alvo = {
        x: coluna * TAMANHO_CELULA + TAMANHO_CELULA / 2,
        y: linha * TAMANHO_CELULA + TAMANHO_CELULA / 2,
        largura: TAMANHO_CELULA,
        altura: TAMANHO_CELULA,
        // Só olhar não cria o canteiro; ele passa a existir quando algo é feito nele
        dica: () => dicaDoCanteiro(this.lavoura.canteiros[chave] ?? novoCanteiro(coluna, linha), this.contexto),
        acao: () => {
          const canteiro = this.lavoura.pegar(coluna, linha);
          const resultado = usarNoCanteiro(canteiro, this.contexto);
          this.mundo.avisos.mostrar(resultado.aviso);
          if (resultado.mudou) this.redesenhar(canteiro);
        },
      };
      this.alvos.set(chave, alvo);
    }
    return alvo;
  }

  // Só redesenha quando a aparência muda (ex.: a planta passou de fase)
  private redesenhar(c: Canteiro) {
    const chave = `${c.coluna},${c.linha}`;
    const aparencia = aparenciaDoCanteiro(c);
    let desenho = this.visuais.get(chave);
    if (desenho?.aparencia === aparencia) return;
    if (!desenho) {
      const { x, y } = this.mundo.mapa.centroDaCelula(c);
      desenho = { visual: criarCanteiro(this.mundo.cena, x, y), aparencia };
      this.visuais.set(chave, desenho);
    }
    desenho.aparencia = aparencia;
    desenharCanteiro(desenho.visual, c);
  }

  private crescer(horas: number, eNoite: boolean) {
    for (const c of this.lavoura.todos()) {
      if (crescer(c, horas, eNoite)) this.redesenhar(c);
    }
  }

  private novoDia(dia: number) {
    const estacao = estacaoDoDia(dia);
    const trocouDeEstacao = estacao !== estacaoDoDia(dia - 1);
    let mortas = 0;
    for (const c of this.lavoura.todos()) {
      secar(c);
      if (trocouDeEstacao && mudarDeEstacao(c, estacao)) mortas++;
      this.redesenhar(c);
    }
    if (mortas > 0) {
      this.mundo.avisos.mostrar(`${quantidade(mortas, 'planta morreu', 'plantas morreram')} com a troca de estação`);
    }
  }
}
