import type Phaser from 'phaser';
import { profundidadeNoMundo } from '../arte/Camadas';
import { criarAnimal } from '../arte/Objetos';
import {
  CAPACIDADE_DO_ABRIGO,
  CAPACIDADE_DO_COMEDOURO,
  ESPECIES,
  ESPECIE_DO_ABRIGO,
  type Abrigo,
} from '../dados/animais';
import { CONSTRUCOES } from '../dados/construcoes';
import { nomeDoItem } from '../dados/itens';
import { LOCAIS_DE_CONSTRUCAO, QUINTAL } from '../dados/mundo';
import {
  comprarAnimal,
  encherComedouro,
  passarDiaDaCriacao,
  recolherDoAbrigo,
  recolherDoAnimal,
  type Animal,
} from '../estado/Criacao';
import { ALIMENTOS } from '../dados/vampiro';
import { beber } from '../estado/Vampiro';
import type { AreaDeCelulas } from '../util/areas';
import type { Construcao } from './Construcao';
import { TAMANHO_CELULA } from './Mapa';
import { registrarMordida, type Mundo } from './Mundo';

const VELOCIDADE: Record<Abrigo, number> = { galinheiro: 32, celeiro: 18 }; // pixels por segundo

interface AnimalNaTela {
  animal: Animal;
  abrigo: Abrigo;
  grafico: Phaser.GameObjects.Graphics;
  destino: { x: number; y: number };
  espera: number; // ms parado antes de andar de novo
}

// Galinhas e vacas: comprados no próprio galinheiro/celeiro, andam pelo quintal (ou pelo
// pasto, se houver a cerca) e dão um produto por dia quando comem. E no abrigo abre o
// menu (comprar, comedouro, recolher); E no animal pega o produto dele.
export class Animais {
  private mundo: Mundo;
  private naTela: AnimalNaTela[] = [];

  constructor(mundo: Mundo, construcao: Construcao) {
    this.mundo = mundo;
    for (const abrigo of ['galinheiro', 'celeiro'] as const) {
      construcao.definirUso(abrigo, {
        dica: () => `${CONSTRUCOES[abrigo].nome} · E: abrir`,
        acao: () => this.abrirMenu(abrigo),
      });
      for (const animal of mundo.criacao.abrigos[abrigo].animais) this.colocarNaTela(animal, abrigo);
    }
    construcao.quandoErguer((id) => {
      if (id === 'pasto') for (const a of this.naTela) a.destino = this.pontoAleatorio(a.abrigo);
    });

    mundo.relogio.ouvir('novo-dia', () => {
      passarDiaDaCriacao(mundo.criacao, mundo.construcoes.tem('pasto'), mundo.relogio.estacao);
      const prontos = this.naTela.filter((a) => a.animal.produtoPronto).length;
      if (prontos > 0) mundo.avisos.mostrar(`Os animais têm ${prontos} ${prontos === 1 ? 'produto' : 'produtos'} para recolher`);
    });
  }

  private abrirMenu(abrigo: Abrigo) {
    const { menu, criacao, inventario, avisos } = this.mundo;
    const especie = ESPECIES[ESPECIE_DO_ABRIGO[abrigo]];
    const dados = criacao.abrigos[abrigo];
    const produto = nomeDoItem(especie.produto).toLowerCase();
    const capacidade = CAPACIDADE_DO_ABRIGO[abrigo];

    menu.abrir(
      () => `${CONSTRUCOES[abrigo].nome} · ${dados.animais.length}/${capacidade} · ${inventario.moedas} moedas`,
      () => {
        const prontos = dados.animais.filter((a) => a.produtoPronto).length;
        const temPasto = this.mundo.construcoes.tem('pasto');
        return [
          {
            texto: `Comprar ${especie.nome.toLowerCase()} — ${especie.preco} moedas`,
            detalhe: `Alimentada, dá 1 ${produto} por dia. Cabem ${capacidade}.`,
            ativa: dados.animais.length < capacidade && inventario.moedas >= especie.preco,
            aoEscolher: () => {
              const resultado = comprarAnimal(criacao, abrigo, inventario, Math.random);
              avisos.mostrar(resultado.aviso);
              if (resultado.mudou) this.colocarNaTela(dados.animais[dados.animais.length - 1], abrigo);
            },
          },
          {
            texto: `Encher o comedouro (${dados.comedouro}/${CAPACIDADE_DO_COMEDOURO})`,
            detalhe:
              'Usa trigo ou feno do inventário. Cada animal come 1 porção por dia.' +
              (temPasto ? ' Com a cerca do pasto, eles só precisam do comedouro no inverno.' : ''),
            aoEscolher: () => avisos.mostrar(encherComedouro(dados, inventario).aviso),
          },
          {
            texto: `Recolher ${produto} (${prontos})`,
            ativa: prontos > 0,
            aoEscolher: () => avisos.mostrar(recolherDoAbrigo(dados, inventario).aviso),
          },
          { texto: 'Fechar', aoEscolher: () => 'fechar' },
        ];
      },
    );
  }

  private areaDeAndar(abrigo: Abrigo): AreaDeCelulas {
    return (this.mundo.construcoes.tem('pasto') && LOCAIS_DE_CONSTRUCAO.pasto) || QUINTAL[abrigo];
  }

  private pontoAleatorio(abrigo: Abrigo): { x: number; y: number } {
    const r = this.mundo.mapa.areaEmPixels(this.areaDeAndar(abrigo));
    const margem = TAMANHO_CELULA / 2;
    return {
      x: r.x - r.largura / 2 + margem + Math.random() * (r.largura - margem * 2),
      y: r.y - r.altura / 2 + margem + Math.random() * (r.altura - margem * 2),
    };
  }

  private colocarNaTela(animal: Animal, abrigo: Abrigo) {
    const inicio = this.pontoAleatorio(abrigo);
    const grafico = criarAnimal(this.mundo.cena, animal.especie, inicio.x, inicio.y);
    const naTela: AnimalNaTela = { animal, abrigo, grafico, destino: this.pontoAleatorio(abrigo), espera: 0 };
    this.naTela.push(naTela);

    const { tamanho, produto } = ESPECIES[animal.especie];
    const nomeDoProduto = nomeDoItem(produto).toLowerCase();
    const { inventario, avisos } = this.mundo;
    this.mundo.interacao.registrar({
      get x() {
        return grafico.x;
      },
      get y() {
        return grafico.y;
      },
      largura: tamanho * 1.6 + 8,
      altura: tamanho + 12,
      dica: () => (animal.produtoPronto ? `${animal.nome} · E: pegar ${nomeDoProduto}` : `${animal.nome} · sem ${nomeDoProduto} hoje`),
      acao: () => {
        if (!this.mundo.relogio.eNoite) {
          avisos.mostrar(recolherDoAnimal(animal, inventario).aviso);
          return;
        }
        this.mundo.menu.abrir(`${animal.nome} cochila no escuro.`, () => [
          ...(animal.produtoPronto ? [{ texto: `Pegar ${nomeDoProduto}`, aoEscolher: () => { avisos.mostrar(recolherDoAnimal(animal, inventario).aviso); return 'fechar' as const; } }] : []),
          {
            texto: `Beber de ${animal.nome}`,
            detalhe: ALIMENTOS.animalDaFazenda.descricao,
            ativa: !animal.fraco,
            aoEscolher: () => {
              animal.fraco = true;
              animal.produtoPronto = false;
              registrarMordida(this.mundo);
              avisos.mostrar(beber(this.mundo.vampiro, 'animalDaFazenda', animal.nome).aviso);
              return 'fechar' as const;
            },
          },
          { texto: 'Deixar dormir', aoEscolher: () => 'fechar' as const },
        ]);
      },
    });
  }

  // Cada animal anda até um ponto sorteado, espera um pouco e sorteia outro
  atualizar(deltaMs: number) {
    for (const a of this.naTela) {
      const { grafico } = a;
      if (a.espera > 0) {
        a.espera -= deltaMs;
      } else {
        const dx = a.destino.x - grafico.x;
        const dy = a.destino.y - grafico.y;
        const distancia = Math.hypot(dx, dy);
        const passo = (VELOCIDADE[a.abrigo] * deltaMs) / 1000;
        if (distancia <= passo) {
          grafico.setPosition(a.destino.x, a.destino.y);
          a.destino = this.pontoAleatorio(a.abrigo);
          a.espera = 1000 + Math.random() * 3000;
        } else {
          grafico.setPosition(grafico.x + (dx / distancia) * passo, grafico.y + (dy / distancia) * passo);
          grafico.setScale(dx < 0 ? -1 : 1, 1);
        }
      }
      grafico.setDepth(profundidadeNoMundo(grafico.y + ESPECIES[a.animal.especie].tamanho / 2));
    }
  }
}
