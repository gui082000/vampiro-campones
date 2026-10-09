import type Phaser from 'phaser';
import { CAMPO_DE_PLANTIO } from '../dados/mundo';
import type { Inventario } from '../estado/Inventario';
import {
  type Canteiro,
  crescer,
  dicaDoCanteiro,
  novoCanteiro,
  usarNoCanteiro,
} from '../estado/Plantacao';
import { type VisualCanteiro, criarCanteiro, desenharCanteiro } from '../arte/Objetos';
import type { Interagivel } from './Interacao';
import type { Mapa } from './Mapa';

// Liga os canteiros ao mundo: cria um para cada célula do campo de plantio, desenha
// cada um e oferece a interação com E. As regras (arar, plantar, regar, crescer,
// colher) ficam em estado/Plantacao.
export class Fazenda {
  readonly canteiros: Canteiro[] = [];

  private visuais: VisualCanteiro[] = [];
  private inventario: Inventario;

  constructor(scene: Phaser.Scene, mapa: Mapa, inventario: Inventario) {
    this.inventario = inventario;

    const { coluna, linha, colunas, linhas } = CAMPO_DE_PLANTIO;
    for (let l = 0; l < linhas; l++) {
      for (let c = 0; c < colunas; c++) {
        const canteiro = novoCanteiro(coluna + c, linha + l);
        const { x, y } = mapa.centroDaCelula(canteiro);
        const visual = criarCanteiro(scene, x, y);
        desenharCanteiro(visual, canteiro);

        this.canteiros.push(canteiro);
        this.visuais.push(visual);
      }
    }
  }

  obterInteragiveis(): Interagivel[] {
    return this.canteiros.map((canteiro, i) => {
      const visual = this.visuais[i];
      return {
        x: visual.solo.x,
        y: visual.solo.y,
        raio: 48,
        destaque: visual.solo,
        dica: () => dicaDoCanteiro(canteiro, this.inventario),
        acao: () => {
          if (usarNoCanteiro(canteiro, this.inventario)) desenharCanteiro(visual, canteiro);
        },
      };
    });
  }

  // Chamado a cada quadro para fazer as plantas regadas crescerem
  atualizar(horasPassadas: number) {
    this.canteiros.forEach((canteiro, i) => {
      if (crescer(canteiro, horasPassadas)) desenharCanteiro(this.visuais[i], canteiro);
    });
  }
}
