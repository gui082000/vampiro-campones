import type Phaser from 'phaser';
import { desenharConstrucao, desenharTerreno } from '../arte/Objetos';
import { CONSTRUCOES, type IdConstrucao } from '../dados/construcoes';
import { LOCAIS_DE_CONSTRUCAO } from '../dados/mundo';
import { construir, faltaPara, textoDoCusto } from '../estado/Construcoes';
import type { Mundo } from './Mundo';

export interface UsoDaConstrucao {
  dica: () => string;
  acao: () => void;
}

// Terrenos do campo (galinheiro, celeiro, poço, cerca do pasto). Antes de construir,
// aparece só a marcação; E no terreno oferece a construção. Depois de pronta, o que
// acontece ao usar cada uma é definido por quem cuida dela (ex.: o sistema de animais).
export class Construcao {
  private mundo: Mundo;
  private terrenos = new Map<IdConstrucao, Phaser.GameObjects.GameObject[]>();
  private usos = new Map<IdConstrucao, UsoDaConstrucao>();
  private aoErguer: ((id: IdConstrucao) => void)[] = [];

  constructor(mundo: Mundo) {
    this.mundo = mundo;
    for (const [id, area] of Object.entries(LOCAIS_DE_CONSTRUCAO) as [IdConstrucao, (typeof LOCAIS_DE_CONSTRUCAO)[IdConstrucao]][]) {
      if (!area) continue;
      const r = mundo.mapa.areaEmPixels(area);
      const nome = CONSTRUCOES[id].nome;
      if (mundo.construcoes.tem(id)) this.erguer(id);
      else this.terrenos.set(id, desenharTerreno(mundo.cena, r, nome));

      // Terrenos grandes (o pasto) só respondem na placa do meio, senão a dica de
      // construir apareceria em qualquer lugar dentro dele
      const grande = area.colunas * area.linhas > 16;
      const alvo = grande ? { x: r.x, y: r.y, largura: 3 * 32, altura: 32 } : r;
      mundo.interacao.registrar({
        ...alvo,
        // A cerca do pasto, depois de pronta, não tem o que fazer: deixa passar
        ativo: () => !(id === 'pasto' && mundo.construcoes.tem('pasto')),
        dica: () =>
          mundo.construcoes.tem(id) ? (this.usos.get(id)?.dica() ?? nome) : `Terreno: ${nome} · E: construir`,
        acao: () => (mundo.construcoes.tem(id) ? this.usos.get(id)?.acao() : this.oferecer(id)),
      });
    }
  }

  // O que acontece ao usar a construção depois de pronta
  definirUso(id: IdConstrucao, uso: UsoDaConstrucao) {
    this.usos.set(id, uso);
  }

  // Avisa quando algo for construído (ex.: a cerca do pasto solta os animais)
  quandoErguer(ouvinte: (id: IdConstrucao) => void) {
    this.aoErguer.push(ouvinte);
  }

  // Menu "Construir X?" (também usado pelas melhorias da casa)
  oferecer(id: IdConstrucao, voltar?: () => void) {
    const { menu, construcoes, inventario, avisos } = this.mundo;
    const { nome, descricao } = CONSTRUCOES[id];
    menu.abrir(`Construir: ${nome}`, () => {
      const falta = faltaPara(id, inventario);
      return [
        {
          texto: falta.length === 0 ? 'Construir' : 'Construir (falta material)',
          detalhe: `${descricao}\nCusta ${textoDoCusto(id)}.${falta.length ? `\nFalta: ${falta.join(', ')}.` : ''}`,
          ativa: falta.length === 0,
          aoEscolher: () => {
            const resultado = construir(id, construcoes, inventario);
            avisos.mostrar(resultado.aviso);
            if (resultado.mudou) this.erguer(id);
            if (voltar) voltar();
            else return 'fechar';
          },
        },
        { texto: voltar ? 'Voltar' : 'Agora não', aoEscolher: () => (voltar ? voltar() : 'fechar') },
      ];
    });
  }

  private erguer(id: IdConstrucao) {
    for (const objeto of this.terrenos.get(id) ?? []) objeto.destroy();
    this.terrenos.delete(id);
    const area = LOCAIS_DE_CONSTRUCAO[id];
    if (area) {
      desenharConstrucao(this.mundo.cena, id, this.mundo.mapa.areaEmPixels(area), CONSTRUCOES[id].nome);
      if (id !== 'pasto') this.mundo.mapa.criarBloqueio(area);
    }
    for (const ouvinte of this.aoErguer) ouvinte(id);
  }
}
