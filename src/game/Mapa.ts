import Phaser from 'phaser';
import { TILE } from './Tileset';
import mapaUrl from '../assets/MapaGame2d.json?url';
import imagemUrl from '../assets/Mapaprincipal.png';

export const CHAVE_MAPA = 'mapa-principal';
export const CHAVE_IMAGEM_MAPA = 'mapa-imagem';
export { mapaUrl, imagemUrl };

// Ids de objeto que não bloqueiam: decoração, pontes e escadas (ver MapaGame2d.json)
const OBJETOS_DECORATIVOS = new Set([6, 9, 11, 14]);

// Formato do arquivo exportado pelo "RPG Map 2" (deepnight.net/tools/rpg-map).
// Só tipamos o que usamos; o arquivo tem bem mais campos (luzes, skin, etc).
interface MapaRpg {
  w: number;
  h: number;
  grounds: { x: number; y: number; c: number | null; s: { id: number } }[];
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
    const dados = scene.cache.json.get(CHAVE_MAPA) as MapaRpg;

    this.colunas = dados.w;
    this.linhas = dados.h;
    this.largura = dados.w * TILE;
    this.altura = dados.h * TILE;

    scene.add.image(0, 0, CHAVE_IMAGEM_MAPA).setOrigin(0, 0).setDepth(0);

    // Células bloqueadas: as de colisão do arquivo mais os objetos sólidos (paredes,
    // árvores, pedras); os decorativos acima ficam de fora.
    const bloqueados = new Set<number>();
    for (const c of dados.collisions) bloqueados.add(Number(c.split(':')[0]));
    for (const o of dados.objects) {
      if (OBJETOS_DECORATIVOS.has(o.t.id)) continue;
      bloqueados.add(o.y * dados.w + o.x);
    }

    this.colisores = scene.physics.add.staticGroup();
    for (const indice of bloqueados) {
      const x = indice % dados.w;
      const y = Math.floor(indice / dados.w);
      const caixa = scene.add.rectangle(this.centroX(x), this.centroY(y), TILE, TILE).setVisible(false);
      scene.physics.add.existing(caixa, true);
      this.colisores.add(caixa);
    }

    for (const r of dados.labels) this.rotulos.set(r.s, { x: r.x * TILE, y: r.y * TILE });
  }

  // Posição (em pixels) de um rótulo escrito no mapa, ex.: "Casa campones"
  posicaoDoRotulo(nome: string): { x: number; y: number } | undefined {
    return this.rotulos.get(nome);
  }

  centroX(coluna: number): number {
    return coluna * TILE + TILE / 2;
  }

  centroY(linha: number): number {
    return linha * TILE + TILE / 2;
  }

}
