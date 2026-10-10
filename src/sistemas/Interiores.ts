import { CAMADA } from '../arte/Camadas';
import { desenharMovel, desenharSala } from '../arte/Objetos';
import { ALTURA, LARGURA } from '../config';
import { INTERIORES, type DefinicaoDeInterior, type IdInterior, type TipoDeMovel } from '../dados/interiores';
import type { Transicao } from '../interface/Transicao';
import type { AreaDeCelulas } from '../util/areas';
import type { Jogador } from './Jogador';
import { TAMANHO_CELULA } from './Mapa';
import { anotarPista, type Mundo } from './Mundo';

export interface UsoDeMovel {
  dica: () => string;
  acao: () => void;
}

const ESPACO_ENTRE_SALAS = 4; // linhas vazias entre uma sala e outra

// Os prédios por dentro. Cada sala é montada uma vez, fora da área do mapa (à direita
// dele); entrar por uma porta escurece a tela, leva o Tomás para a sala e prende a câmera
// nela. A porta de baixo da sala leva de volta para a frente do prédio.
export class Interiores {
  local: IdInterior | 'fora' = 'fora';
  readonly largura: number; // até onde o mundo vai, contando as salas (pixels)
  readonly altura: number;

  private mundo: Mundo;
  private transicao: Transicao;
  private jogador: Jogador;
  private cantos = new Map<IdInterior, { coluna: number; linha: number }>();
  private usos = new Map<string, UsoDeMovel>();
  private volta = { coluna: 0, linha: 0 };

  constructor(mundo: Mundo, transicao: Transicao, jogador: Jogador) {
    this.mundo = mundo;
    this.transicao = transicao;
    this.jogador = jogador;

    // Longe o bastante do mapa para a beirada dele não aparecer em volta da sala
    const coluna = mundo.mapa.colunas + Math.ceil(LARGURA / TAMANHO_CELULA);
    let linha = 2;
    let maiorLargura = 0;
    for (const id of Object.keys(INTERIORES) as IdInterior[]) {
      const sala: DefinicaoDeInterior = INTERIORES[id];
      this.cantos.set(id, { coluna, linha });
      linha += sala.linhas + ESPACO_ENTRE_SALAS;
      maiorLargura = Math.max(maiorLargura, sala.colunas);
    }
    this.largura = (coluna + maiorLargura) * TAMANHO_CELULA + LARGURA;
    this.altura = Math.max(mundo.mapa.altura, linha * TAMANHO_CELULA + ALTURA);

    // Fundo escuro em volta das salas
    mundo.cena.add
      .rectangle(mundo.mapa.largura, 0, this.largura - mundo.mapa.largura, this.altura, 0x0a0806)
      .setOrigin(0)
      .setDepth(CAMADA.mapa);
    for (const id of this.cantos.keys()) this.montar(id, INTERIORES[id]);
  }

  // O que acontece ao usar um tipo de móvel numa sala (ex.: a cama da casa do Tomás)
  definirUso(sala: IdInterior, tipo: TipoDeMovel, uso: UsoDeMovel) {
    this.usos.set(`${sala}.${tipo}`, uso);
  }

  // Entra na sala; `voltarPara` é a célula fora onde o Tomás aparece ao sair
  entrar(id: IdInterior, voltarPara: { coluna: number; linha: number }) {
    this.transicao.escurecerE(() => {
      const porta = this.portaDe(id);
      this.jogador.teleportar(porta.coluna, porta.linha - 1, 'cima');
      this.prenderCamera(id);
      this.local = id;
      this.volta = voltarPara;
    });
  }

  private sair() {
    this.transicao.escurecerE(() => {
      this.jogador.teleportar(this.volta.coluna, this.volta.linha, 'baixo');
      const { mapa, cena } = this.mundo;
      cena.cameras.main.setBounds(0, 0, mapa.largura, mapa.altura);
      this.local = 'fora';
    });
  }

  // Célula do mundo para uma posição dentro da sala (sem contar as paredes)
  celulaNaSala(id: IdInterior, coluna: number, linha: number): { coluna: number; linha: number } {
    const canto = this.cantos.get(id)!;
    return { coluna: canto.coluna + 1 + coluna, linha: canto.linha + 1 + linha };
  }

  private areaDa(id: IdInterior): AreaDeCelulas {
    const { coluna, linha } = this.cantos.get(id)!;
    const sala: DefinicaoDeInterior = INTERIORES[id];
    return { coluna, linha, colunas: sala.colunas, linhas: sala.linhas };
  }

  private portaDe(id: IdInterior): { coluna: number; linha: number } {
    const area = this.areaDa(id);
    return { coluna: area.coluna + Math.floor(area.colunas / 2), linha: area.linha + area.linhas - 1 };
  }

  // A sala é menor que a tela: a câmera fica parada com a sala no meio
  private prenderCamera(id: IdInterior) {
    const r = this.mundo.mapa.areaEmPixels(this.areaDa(id));
    this.mundo.cena.cameras.main.setBounds(r.x - LARGURA / 2, r.y - ALTURA / 2, LARGURA, ALTURA);
  }

  private montar(id: IdInterior, sala: DefinicaoDeInterior) {
    const { mapa, cena, interacao, avisos } = this.mundo;
    const area = this.areaDa(id);
    const porta = this.portaDe(id);
    const celulaDaPorta = { ...porta, colunas: 1, linhas: 1 };
    desenharSala(cena, mapa.areaEmPixels(area), mapa.areaEmPixels(celulaDaPorta), sala.estilo);

    // Paredes (a parede de baixo inteira também bloqueia; a porta se usa com E)
    const { coluna, linha, colunas, linhas } = area;
    mapa.criarBloqueio({ coluna, linha, colunas, linhas: 1 });
    mapa.criarBloqueio({ coluna, linha: linha + linhas - 1, colunas, linhas: 1 });
    mapa.criarBloqueio({ coluna, linha, colunas: 1, linhas });
    mapa.criarBloqueio({ coluna: coluna + colunas - 1, linha, colunas: 1, linhas });

    interacao.registrar({
      ...mapa.areaEmPixels(celulaDaPorta),
      dica: () => 'Porta · E: sair',
      acao: () => this.sair(),
    });

    for (const movel of sala.moveis) {
      const lugar = { coluna: coluna + 1 + movel.coluna, linha: linha + 1 + movel.linha, colunas: movel.colunas, linhas: movel.linhas };
      const r = mapa.areaEmPixels(lugar);
      desenharMovel(cena, r, movel.tipo);
      mapa.criarBloqueio(lugar);
      const chave = `${id}.${movel.tipo}`;
      interacao.registrar({
        ...r,
        dica: () => this.usos.get(chave)?.dica() ?? `${movel.nome}${movel.texto ? ' · E: olhar' : ''}`,
        acao: () => {
          const uso = this.usos.get(chave);
          if (uso) uso.acao();
          else if (movel.pista && movel.texto) {
            avisos.mostrar(movel.texto);
            anotarPista(this.mundo, movel.texto);
          } else avisos.mostrar(movel.texto);
        },
      });
    }
  }
}
