import { criarRotulo, desenharCercaDoCemiterio, desenharLapide, desenharPlaca, desenharPredio } from '../arte/Objetos';
import { CEMITERIO, PLACAS, PREDIOS } from '../dados/vila';
import type { Interiores } from './Interiores';
import { TAMANHO_CELULA } from './Mapa';
import { anotarPista, type Mundo } from './Mundo';

// O mundo construído por cima do mapa: os prédios (com porta para entrar ou trancados),
// o cemitério com as lápides que contam a história e as placas pelos caminhos.
export class Vila {
  constructor(mundo: Mundo, interiores: Interiores) {
    const { mapa, cena, interacao, avisos } = mundo;

    for (const predio of Object.values(PREDIOS)) {
      const porta = mapa.areaEmPixels({ ...predio.porta, colunas: 1, linhas: 1 });
      desenharPredio(cena, mapa.areaEmPixels(predio.area), porta, predio.estilo, predio.nome);
      mapa.criarBloqueio(predio.area);
      const fora = { coluna: predio.porta.coluna, linha: predio.porta.linha + 1 };
      interacao.registrar({
        ...porta,
        dica: () => (predio.interior ? `${predio.nome} · E: entrar` : `${predio.nome} · trancado`),
        acao: () => {
          if (predio.interior) return interiores.entrar(predio.interior, fora);
          avisos.mostrar(predio.trancado);
          if (predio.trancado) anotarPista(mundo, predio.trancado);
        },
      });
    }

    // Cemitério: lápides em fileiras, pulando uma célula, só onde o chão é livre
    const { area, lapides } = CEMITERIO;
    desenharCercaDoCemiterio(cena, mapa.areaEmPixels(area));
    let proxima = 0;
    for (let linha = area.linha + 1; linha < area.linha + area.linhas - 1 && proxima < lapides.length; linha += 2) {
      for (let coluna = area.coluna + 1; coluna < area.coluna + area.colunas - 1 && proxima < lapides.length; coluna += 2) {
        if (!mapa.livre(coluna, linha)) continue;
        const texto = lapides[proxima++];
        const { x, y } = mapa.centroDaCelula({ coluna, linha });
        desenharLapide(cena, x, y);
        mapa.criarBloqueio({ coluna, linha, colunas: 1, linhas: 1 });
        interacao.registrar({
          x,
          y,
          largura: TAMANHO_CELULA,
          altura: TAMANHO_CELULA,
          dica: () => 'Lápide · E: ler',
          acao: () => {
            avisos.mostrar(texto);
            anotarPista(mundo, texto);
          },
        });
      }
    }

    for (const placa of PLACAS) {
      const { x, y } = mapa.centroDaCelula(placa);
      desenharPlaca(cena, x, y);
      criarRotulo(cena, x, y - 22, placa.texto);
    }
  }
}
