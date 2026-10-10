import type Phaser from 'phaser';
import { criarRecurso, desenharRecurso } from '../arte/Objetos';
import {
  AREAS_DE_PLANTIO,
  AREAS_DE_RECURSOS,
  BANCADA,
  CAIXA_DE_VENDA,
  INICIO_JOGADOR,
  LOCAIS_DE_CONSTRUCAO,
  QUINTAL,
  SEMENTE_DOS_RECURSOS,
} from '../dados/mundo';
import { CEMITERIO, PLACAS, PREDIOS } from '../dados/vila';
import { definicaoDoRecurso } from '../dados/recursos';
import {
  dicaDoRecurso,
  espalharRecursos,
  estaPresente,
  passarDiaDoRecurso,
  temColheita,
  usarNoRecurso,
  type ContextoDaColeta,
  type NoDeRecurso,
} from '../estado/Recursos';
import { criarAleatorio } from '../util/aleatorio';
import { comMargem, dentroDeAlguma, type AreaDeCelulas } from '../util/areas';
import { TAMANHO_CELULA } from './Mapa';
import type { Mundo } from './Mundo';

// Lugares onde nunca nasce recurso (com 1 célula de folga em volta)
const PROIBIDAS: AreaDeCelulas[] = [
  ...AREAS_DE_PLANTIO,
  ...Object.values(LOCAIS_DE_CONSTRUCAO),
  ...Object.values(QUINTAL),
  CAIXA_DE_VENDA,
  BANCADA,
  CEMITERIO.area,
  ...Object.values(PREDIOS).flatMap((p) => [p.area, { coluna: p.porta.coluna, linha: p.porta.linha + 1, colunas: 1, linhas: 2 }]),
  ...PLACAS.map((p) => ({ ...p, colunas: 1, linhas: 1 })),
  { ...INICIO_JOGADOR, colunas: 1, linhas: 1 },
].map((area) => comMargem(area, 1));

// Árvores, pedras, mato, amoras, ervas e cogumelos espalhados pelo campo. Cada um
// fica sempre no mesmo lugar; o que é colhido volta depois de alguns dias.
export class Coleta {
  readonly nos: NoDeRecurso[];

  private mundo: Mundo;
  private desenhos: { grafico: Phaser.GameObjects.Graphics; bloqueio: Phaser.GameObjects.Rectangle | null }[] = [];

  constructor(mundo: Mundo) {
    this.mundo = mundo;
    const livre = (coluna: number, linha: number) => mundo.mapa.livre(coluna, linha) && !dentroDeAlguma(PROIBIDAS, coluna, linha);
    this.nos = espalharRecursos(AREAS_DE_RECURSOS, livre, criarAleatorio(SEMENTE_DOS_RECURSOS));

    this.nos.forEach((no, i) => {
      const { x, y } = mundo.mapa.centroDaCelula(no);
      const celula = { coluna: no.coluna, linha: no.linha, colunas: 1, linhas: 1 };
      this.desenhos.push({
        grafico: criarRecurso(mundo.cena, x, y),
        bloqueio: definicaoDoRecurso(no.tipo).solido ? mundo.mapa.criarBloqueio(celula) : null,
      });
      mundo.interacao.registrar({
        x,
        y,
        largura: TAMANHO_CELULA,
        altura: TAMANHO_CELULA,
        ativo: () => estaPresente(no, mundo.relogio.estacao),
        dica: () => dicaDoRecurso(no, this.contexto),
        acao: () => this.usar(i),
      });
      this.redesenhar(i);
    });

    mundo.relogio.ouvir('novo-dia', () => {
      for (const no of this.nos) passarDiaDoRecurso(no);
      this.nos.forEach((_, i) => this.redesenhar(i));
    });
  }

  // Ao carregar um save: copia o estado de cada recurso (mesmas posições, mesma semente)
  restaurar(salvos: NoDeRecurso[]) {
    salvos.forEach((salvo, i) => {
      const no = this.nos[i];
      if (!no || no.tipo !== salvo.tipo || no.coluna !== salvo.coluna || no.linha !== salvo.linha) return;
      no.golpes = salvo.golpes;
      no.diasParaVoltar = salvo.diasParaVoltar;
    });
    this.nos.forEach((_, i) => this.redesenhar(i));
  }

  private get contexto(): ContextoDaColeta {
    const { inventario, energia, relogio } = this.mundo;
    return { inventario, energia, estacao: relogio.estacao, aleatorio: Math.random };
  }

  private usar(i: number) {
    const resultado = usarNoRecurso(this.nos[i], this.contexto);
    this.mundo.avisos.mostrar(resultado.aviso);
    if (!resultado.mudou) return;
    const { grafico } = this.desenhos[i];
    this.mundo.cena.tweens.add({ targets: grafico, x: grafico.x + 2, duration: 40, yoyo: true, repeat: 1 });
    this.redesenhar(i);
  }

  private redesenhar(i: number) {
    const no = this.nos[i];
    const { grafico, bloqueio } = this.desenhos[i];
    const estacao = this.mundo.relogio.estacao;
    const presente = estaPresente(no, estacao);
    grafico.setVisible(presente);
    if (presente) desenharRecurso(grafico, no.tipo, temColheita(no, estacao));
    if (bloqueio) this.mundo.mapa.definirBloqueio(bloqueio, presente);
  }
}
