import Phaser from 'phaser';
import { criarCasa } from './Casa';
import { Aldeao } from './Aldeao';

const CORES_ALDEOES = [0xdb7093, 0x4a90d9, 0xd9a24a, 0x7bd96a];

// Cidade vizinha: um punhado de casas, cada uma com um aldeão que anda por perto.
// Monta tudo a partir de um ponto central — mover a vila no mapa é só mudar esse ponto.
export class Vila {
  private aldeoes: Aldeao[] = [];

  constructor(scene: Phaser.Scene, centroX: number, centroY: number) {
    const posicoesCasas = [
      { x: centroX - 180, y: centroY - 40 },
      { x: centroX - 60, y: centroY - 60 },
      { x: centroX + 60, y: centroY - 40 },
      { x: centroX + 180, y: centroY - 60 },
    ];

    posicoesCasas.forEach(({ x, y }, i) => {
      criarCasa(scene, x, y);
      const cor = CORES_ALDEOES[i % CORES_ALDEOES.length];
      this.aldeoes.push(new Aldeao(scene, x, y + 50, cor));
    });
  }

  atualizar(tempo: number) {
    for (const aldeao of this.aldeoes) aldeao.atualizar(tempo);
  }
}
