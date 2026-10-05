import Phaser from 'phaser';
import { COLHEITA_POR_PLANTA, HORAS_PARA_CRESCER, TAMANHO_CANTEIRO } from './config';
import type { Interagivel } from './Interagivel';
import type { Inventario } from './Inventario';

interface Canteiro {
  x: number;
  y: number;
  estado: 'grama' | 'arado' | 'plantado';
  regado: boolean;
  horasCrescendo: number;
  solo: Phaser.GameObjects.Rectangle;
  planta: Phaser.GameObjects.Rectangle;
}

// Cria e administra os canteiros: arar, plantar, regar, crescer e colher.
// Expõe os canteiros como Interagiveis para o jogador poder interagir com E.
export class Fazenda {
  private canteiros: Canteiro[] = [];

  private scene: Phaser.Scene;
  private inventario: Inventario;

  constructor(scene: Phaser.Scene, inventario: Inventario, centroX: number, topoY: number) {
    this.scene = scene;
    this.inventario = inventario;

    const colunas = 6;
    const linhas = 2;
    const espaco = 52;
    const inicioX = centroX - ((colunas - 1) * espaco) / 2;

    for (let l = 0; l < linhas; l++) {
      for (let c = 0; c < colunas; c++) {
        const x = inicioX + c * espaco;
        const y = topoY + l * espaco;
        this.criarCanteiro(x, y);
      }
    }
  }

  private criarCanteiro(x: number, y: number) {
    const solo = this.scene.add.rectangle(x, y, TAMANHO_CANTEIRO, TAMANHO_CANTEIRO, 0x3d6b2f);
    const planta = this.scene.add.rectangle(x, y, 4, 4, 0x6abe30).setVisible(false);

    const canteiro: Canteiro = { x, y, estado: 'grama', regado: false, horasCrescendo: 0, solo, planta };
    this.canteiros.push(canteiro);
    this.desenhar(canteiro);
  }

  // Interagiveis para o jogador poder apertar E em cada canteiro
  obterInteragiveis(): Interagivel[] {
    return this.canteiros.map((canteiro) => ({
      x: canteiro.x,
      y: canteiro.y,
      raio: 48,
      destaque: canteiro.solo,
      dica: () => this.dica(canteiro),
      acao: () => this.acao(canteiro),
    }));
  }

  private estaPronto(c: Canteiro): boolean {
    return c.estado === 'plantado' && c.horasCrescendo >= HORAS_PARA_CRESCER;
  }

  private dica(c: Canteiro): string {
    const ferramenta = this.inventario.ferramenta;

    if (c.estado === 'plantado') {
      if (this.estaPronto(c)) return 'E: colher';
      if (ferramenta === 'regador') return c.regado ? 'Já está regado' : 'E: regar';
      const pct = Math.floor((c.horasCrescendo / HORAS_PARA_CRESCER) * 100);
      return `Crescendo... ${pct}%${c.regado ? '' : ' · precisa de água (2: regador)'}`;
    }

    if (c.estado === 'arado') {
      if (ferramenta === 'sementes') {
        return this.inventario.sementes > 0 ? 'E: plantar semente' : 'Sem sementes (compre na barraca)';
      }
      if (ferramenta === 'regador') return c.regado ? 'Já está regado' : 'E: regar';
      return 'Terra pronta (3: sementes)';
    }

    return ferramenta === 'enxada' ? 'E: arar a terra' : 'Pegue a enxada (1) para arar';
  }

  private acao(c: Canteiro) {
    const ferramenta = this.inventario.ferramenta;

    if (c.estado === 'plantado') {
      if (this.estaPronto(c)) {
        this.inventario.trigo += COLHEITA_POR_PLANTA;
        c.estado = 'arado';
        c.regado = false;
        c.horasCrescendo = 0;
      } else if (ferramenta === 'regador') {
        c.regado = true;
      }
    } else if (c.estado === 'arado') {
      if (ferramenta === 'sementes' && this.inventario.sementes > 0) {
        this.inventario.sementes -= 1;
        c.estado = 'plantado';
        c.horasCrescendo = 0;
      } else if (ferramenta === 'regador') {
        c.regado = true;
      }
    } else if (ferramenta === 'enxada') {
      c.estado = 'arado';
    }

    this.desenhar(c);
    this.inventario.atualizarHud();
  }

  // Chamado a cada quadro para fazer as plantas regadas crescerem
  atualizar(deltaHoras: number) {
    for (const c of this.canteiros) {
      if (c.estado !== 'plantado' || !c.regado) continue;
      c.horasCrescendo = Math.min(c.horasCrescendo + deltaHoras, HORAS_PARA_CRESCER);
      this.desenhar(c);
    }
  }

  // A rega vale até a colheita: não seca com a passagem dos dias.
  novoDia() {
    // Nada a fazer aqui — mantido para a Cena poder avisar a Fazenda sem acoplamento.
  }

  private desenhar(c: Canteiro) {
    if (c.estado === 'grama') {
      c.solo.setFillStyle(0x3d6b2f);
    } else {
      c.solo.setFillStyle(c.regado ? 0x3a2410 : 0x6b4a2a); // terra molhada fica mais escura
    }

    if (c.estado !== 'plantado') {
      c.planta.setVisible(false);
      return;
    }

    const progresso = c.horasCrescendo / HORAS_PARA_CRESCER;
    const tamanho = 6 + progresso * 22;
    c.planta.setVisible(true);
    c.planta.setSize(tamanho, tamanho);
    c.planta.setFillStyle(progresso >= 1 ? 0xf2c230 : 0x6abe30);
  }
}
