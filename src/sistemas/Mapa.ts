import type Phaser from 'phaser';
import { CHAVE_MAPA_DADOS, CHAVE_MAPA_IMAGEM } from '../arte/carregar';
import { CAMADA } from '../arte/Camadas';

// Tamanho de cada célula do mapa, em pixels
export const TAMANHO_CELULA = 32;

// Ids de objeto que não bloqueiam: decoração, pontes e escadas (ver MapaGame2d.json)
const OBJETOS_DECORATIVOS = new Set([6, 9, 11, 14]);

// Formato do arquivo exportado pelo "RPG Map 2" (deepnight.net/tools/rpg-map).
// Só tipamos o que usamos; o arquivo tem bem mais campos (luzes, skin, etc).
interface MapaRpg {
  w: number;
  h: number;
  objects: { x: number; y: number; t: { id: number } }[];
  collisions: string[]; // "indice:0", onde indice = y * w + x
  labels: { s: string; x: number; y: number }[];
}

// Mapa do jogo: a arte é a imagem exportada do RPG Map 2 (Mapaprincipal.png, 32 px por
// célula, mesma grade do JSON). O JSON fornece só o que a imagem não tem: colisões,
// posição dos objetos que bloqueiam e os rótulos. Se editar o mapa no RPG Map 2,
// reexporte o PNG e o JSON juntos.
export class Mapa {
  readonly colunas: number;
  readonly linhas: number;
  readonly largura: number;
  readonly altura: number;
  readonly colisores: Phaser.Physics.Arcade.StaticGroup;

  private rotulos = new Map<string, { x: number; y: number }>();

  constructor(scene: Phaser.Scene) {
    const dados = scene.cache.json.get(CHAVE_MAPA_DADOS) as MapaRpg;

    this.colunas = dados.w;
    this.linhas = dados.h;
    this.largura = dados.w * TAMANHO_CELULA;
    this.altura = dados.h * TAMANHO_CELULA;

    scene.add.image(0, 0, CHAVE_MAPA_IMAGEM).setOrigin(0, 0).setDepth(CAMADA.mapa);

    // Células bloqueadas: as de colisão do arquivo mais os objetos sólidos (paredes,
    // árvores, pedras); os decorativos acima ficam de fora.
    const bloqueados = new Set<number>();
    for (const c of dados.collisions) bloqueados.add(Number(c.split(':')[0]));
    for (const o of dados.objects) {
      if (OBJETOS_DECORATIVOS.has(o.t.id)) continue;
      bloqueados.add(o.y * dados.w + o.x);
    }

    for (const indice of this.celulasDeAgua(scene, dados.w, dados.h)) bloqueados.add(indice);

    this.colisores = scene.physics.add.staticGroup();
    for (const indice of bloqueados) {
      const x = indice % dados.w;
      const y = Math.floor(indice / dados.w);
      const caixa = scene.add
        .rectangle(this.centroX(x), this.centroY(y), TAMANHO_CELULA, TAMANHO_CELULA)
        .setVisible(false);
      scene.physics.add.existing(caixa, true);
      this.colisores.add(caixa);
    }

    for (const r of dados.labels) {
      this.rotulos.set(r.s, { x: r.x * TAMANHO_CELULA, y: r.y * TAMANHO_CELULA });
    }
  }

  // O JSON não diz onde há água, então lemos a cor na própria imagem: reduzimos o PNG
  // para AMOSTRAS x AMOSTRAS pixels por célula e marcamos como água a célula em que
  // metade ou mais das amostras é azul-escuro. Pontes (cor diferente) ficam livres.
  private celulasDeAgua(scene: Phaser.Scene, colunas: number, linhas: number): number[] {
    const AMOSTRAS = 4;
    const imagem = scene.textures.get(CHAVE_MAPA_IMAGEM).getSourceImage() as HTMLImageElement;
    const canvas = document.createElement('canvas');
    canvas.width = colunas * AMOSTRAS;
    canvas.height = linhas * AMOSTRAS;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = false; // vizinho mais próximo: sem misturar cores da margem
    ctx.drawImage(imagem, 0, 0, canvas.width, canvas.height);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const agua: number[] = [];
    for (let y = 0; y < linhas; y++) {
      for (let x = 0; x < colunas; x++) {
        let azuis = 0;
        for (let sy = 0; sy < AMOSTRAS; sy++) {
          for (let sx = 0; sx < AMOSTRAS; sx++) {
            const i = ((y * AMOSTRAS + sy) * canvas.width + x * AMOSTRAS + sx) * 4;
            const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
            // água do mapa ≈ rgb(49,41,99); montanha roxa (60,52,67) e grama não passam
            if (b > 80 && b - r >= 30 && b - g >= 35) azuis++;
          }
        }
        if (azuis >= (AMOSTRAS * AMOSTRAS) / 2) agua.push(y * colunas + x);
      }
    }
    return agua;
  }

  // Posição (em pixels) de um rótulo escrito no mapa, ex.: "Casa campones"
  posicaoDoRotulo(nome: string): { x: number; y: number } | undefined {
    return this.rotulos.get(nome);
  }

  centroX(coluna: number): number {
    return coluna * TAMANHO_CELULA + TAMANHO_CELULA / 2;
  }

  centroY(linha: number): number {
    return linha * TAMANHO_CELULA + TAMANHO_CELULA / 2;
  }

  // Centro (em pixels) de uma célula dada em coluna/linha, como nas posições de dados/mundo
  centroDaCelula(celula: { coluna: number; linha: number }): { x: number; y: number } {
    return { x: this.centroX(celula.coluna), y: this.centroY(celula.linha) };
  }
}
