import type Phaser from 'phaser';
import { profundidadeNoMundo } from '../arte/Camadas';
import { criarRotulo } from '../arte/Objetos';
import { FOGUEIRA } from '../dados/vigilancia';
import type { Corpo } from '../estado/Suspeita';
import type { Interagivel } from './Interacao';
import type { Interiores } from './Interiores';
import type { Jogador } from './Jogador';
import { TAMANHO_CELULA } from './Mapa';
import type { Mundo } from './Mundo';

// Quem morre deixa um corpo onde estava. O Tomás pode carregá-lo (anda mais devagar)
// até a fogueira abaixo das ruínas da colina e queimá-lo. O que não for queimado até o
// amanhecer é encontrado pela vila (ver Vigilancia).
export class Evidencias {
  private mundo: Mundo;
  private interiores: Interiores;
  private jogador: Jogador;
  private desenhos = new Map<Corpo, Phaser.GameObjects.Graphics>();
  private lidos: number;

  constructor(mundo: Mundo, interiores: Interiores, jogador: Jogador) {
    this.mundo = mundo;
    this.interiores = interiores;
    this.jogador = jogador;
    this.lidos = mundo.vampiro.registro.length;
    const { cena, mapa, interacao, suspeita, avisos } = mundo;

    const { x, y } = mapa.centroDaCelula(FOGUEIRA);
    const g = cena.add.graphics({ x, y }).setDepth(profundidadeNoMundo(y + 10));
    g.fillStyle(0x4a4040, 1);
    g.fillCircle(0, 4, 13);
    g.fillStyle(0x2a1a14, 1);
    for (const a of [-6, 0, 6]) g.fillRect(a - 2, -4, 4, 14);
    criarRotulo(cena, x, y - 24, 'Fogueira');
    mapa.criarBloqueio({ ...FOGUEIRA, colunas: 1, linhas: 1 });
    interacao.registrar({
      x,
      y,
      largura: TAMANHO_CELULA,
      altura: TAMANHO_CELULA,
      dica: () => (suspeita.carregando ? 'Fogueira · E: queimar o corpo' : 'Fogueira de cinzas antigas'),
      acao: () => {
        const corpo = suspeita.carregando;
        if (!corpo) return;
        suspeita.carregando = null;
        suspeita.corpos = suspeita.corpos.filter((c) => c !== corpo);
        avisos.mostrar(`O corpo de ${corpo.quem} virou cinza. Ninguém vai encontrá-lo.`);
      },
    });

    interacao.registrarProvedor((coluna, linha) => this.corpoEm(coluna, linha));
    mundo.relogio.ouvir('novo-dia', () => this.redesenhar());
  }

  private corpoEm(coluna: number, linha: number): Interagivel | null {
    const { suspeita, avisos } = this.mundo;
    const corpo = suspeita.corpos.find(
      (c) => c !== suspeita.carregando && c.sala === this.interiores.local && c.coluna === coluna && c.linha === linha,
    );
    if (!corpo) return null;
    return {
      x: coluna * TAMANHO_CELULA + TAMANHO_CELULA / 2,
      y: linha * TAMANHO_CELULA + TAMANHO_CELULA / 2,
      largura: TAMANHO_CELULA,
      altura: TAMANHO_CELULA,
      dica: () => (suspeita.carregando ? 'Você já está carregando um corpo' : `Corpo de ${corpo.quem} · E: carregar`),
      acao: () => {
        if (suspeita.carregando) return;
        suspeita.carregando = corpo;
        avisos.mostrar('Leve até a fogueira, abaixo das ruínas da colina, antes de amanhecer.');
        this.redesenhar();
      },
    };
  }

  // Toda morte nova deixa um corpo na célula à frente do Tomás (onde a vítima estava)
  atualizar() {
    const registro = this.mundo.vampiro.registro;
    for (; this.lidos < registro.length; this.lidos++) {
      const [tipo, quem] = registro[this.lidos].split(':');
      if (tipo !== 'desaparecido') continue;
      const { coluna, linha } = this.jogador.celulaDaFrente;
      const nome = quem === 'viajante' ? 'um viajante' : quem.charAt(0).toUpperCase() + quem.slice(1);
      this.mundo.suspeita.corpos.push({ sala: this.interiores.local, coluna, linha, quem: nome });
      this.redesenhar();
    }
  }

  private redesenhar() {
    const { suspeita, cena, mapa } = this.mundo;
    for (const [corpo, g] of this.desenhos) {
      if (!suspeita.corpos.includes(corpo) || corpo === suspeita.carregando) {
        g.destroy();
        this.desenhos.delete(corpo);
      }
    }
    for (const corpo of suspeita.corpos) {
      if (corpo === suspeita.carregando || this.desenhos.has(corpo)) continue;
      const { x, y } = mapa.centroDaCelula(corpo);
      const g = cena.add.graphics({ x, y }).setDepth(profundidadeNoMundo(y));
      g.fillStyle(0x3a2a2a, 1);
      g.fillEllipse(0, 4, 28, 12);
      g.fillStyle(0x6a1a1a, 0.8);
      g.fillEllipse(8, 8, 10, 4);
      this.desenhos.set(corpo, g);
    }
  }
}
