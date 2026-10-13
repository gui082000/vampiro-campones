import Phaser from 'phaser';
import { profundidadeNoMundo } from '../arte/Camadas';
import { CHAVE_JOGADOR, ESCALA_JOGADOR, animacaoAndar, quadroParado } from '../arte/Personagem';
import { ALDEOES, type DefinicaoDeAldeao, type IdAldeao, type Lugar } from '../dados/aldeoes';
import { nomeDoItem } from '../dados/itens';
import { MISSOES, type DefinicaoDeMissao } from '../dados/missoes';
import { aceitar, entregar, missaoAtiva, missaoDisponivel, podeEntregar, textoDoPedido } from '../estado/Missoes';
import { ALIMENTOS } from '../dados/vampiro';
import { conversar, presentear, registrarMorte } from '../estado/Relacoes';
import { beber, sinalVisivel } from '../estado/Vampiro';
import type { Dialogo } from '../interface/Dialogo';
import type { Interiores } from './Interiores';
import { TAMANHO_CELULA } from './Mapa';
import { anotarPista, registrarMordida, type Mundo } from './Mundo';
import type { Jogador } from './Jogador';
import { SUSPEITA } from '../config';
import { raioDeVisao } from '../estado/Clima';
import { RONDA, RONDA_COMECA, RONDA_TERMINA } from '../dados/vigilancia';
import { nivel, somarSuspeita } from '../estado/Suspeita';

const VELOCIDADE = 34; // pixels por segundo, passeando

interface AldeaoNaTela {
  id: IdAldeao;
  sprite: Phaser.GameObjects.Sprite;
  lugarAtual: number; // índice na rotina
  base: { x: number; y: number };
  destino: { x: number; y: number };
  espera: number;
  sala: Lugar['sala'];
}

// Os moradores: cada um segue a rotina do dia (em casa, no trabalho, na taverna...),
// passeia um pouco onde está e conversa com o Tomás. E num aldeão abre as opções:
// conversar, aceitar ou entregar um pedido e dar o item da mão de presente.
export class Aldeoes {
  private mundo: Mundo;
  private interiores: Interiores;
  private dialogo: Dialogo;
  private naTela: AldeaoNaTela[] = [];

  private jogador: Jogador;
  private passoDaRonda = 0;

  constructor(mundo: Mundo, interiores: Interiores, dialogo: Dialogo, jogador: Jogador) {
    this.mundo = mundo;
    this.jogador = jogador;
    mundo.testemunhas = () => this.testemunhas();
    this.interiores = interiores;
    this.dialogo = dialogo;

    for (const id of Object.keys(ALDEOES) as IdAldeao[]) {
      const def: DefinicaoDeAldeao = ALDEOES[id];
      const sprite = mundo.cena.add.sprite(0, 0, CHAVE_JOGADOR, quadroParado('baixo')).setScale(ESCALA_JOGADOR).setTint(def.cor);
      const a: AldeaoNaTela = { id, sprite, lugarAtual: -1, base: { x: 0, y: 0 }, destino: { x: 0, y: 0 }, espera: 0, sala: 'fora' };
      this.naTela.push(a);
      mundo.interacao.registrar({
        get x() {
          return sprite.x;
        },
        get y() {
          return sprite.y + 8;
        },
        largura: TAMANHO_CELULA,
        altura: TAMANHO_CELULA * 1.5,
        ativo: () => mundo.relacoes.vivo(id),
        dica: () => (this.dormindo(id) ? `${def.nome} dorme · E: aproximar-se` : `${def.nome} · E: conversar`),
        acao: () => this.abrirConversa(id),
      });
    }
    mundo.relogio.ouvir('novo-dia', () => mundo.relacoes.novoDia());
    this.atualizar(0);
  }

  // Onde o aldeão está agora (para outros sistemas, ex.: a loja só abre com a Dona Cida lá)
  salaDe(id: IdAldeao): Lugar['sala'] {
    return this.naTela.find((a) => a.id === id)?.sala ?? 'fora';
  }

  private lugarDaHora(def: DefinicaoDeAldeao): number {
    const hora = this.mundo.relogio.hora;
    let indice = def.rotina.length - 1; // antes do primeiro horário, vale o último (da noite anterior)
    def.rotina.forEach(([inicio], i) => {
      if (hora >= inicio) indice = i;
    });
    return indice;
  }

  // Centro em pixels do lugar; fora, procura a célula livre mais perto se a pedida estiver ocupada
  private pontoDo(lugar: Lugar): { x: number; y: number } {
    if (lugar.sala !== 'fora') return this.mundo.mapa.centroDaCelula(this.interiores.celulaNaSala(lugar.sala, lugar.coluna, lugar.linha));
    const { mapa } = this.mundo;
    for (let raio = 0; raio < 6; raio++) {
      for (let dy = -raio; dy <= raio; dy++) {
        for (let dx = -raio; dx <= raio; dx++) {
          if (mapa.livre(lugar.coluna + dx, lugar.linha + dy)) return mapa.centroDaCelula({ coluna: lugar.coluna + dx, linha: lugar.linha + dy });
        }
      }
    }
    return mapa.centroDaCelula(lugar);
  }

  atualizar(deltaMs: number) {
    for (const a of this.naTela) {
      if (!this.mundo.relacoes.vivo(a.id)) {
        a.sprite.setVisible(false);
        continue;
      }
      const def: DefinicaoDeAldeao = ALDEOES[a.id];
      if (this.emRonda(a.id)) {
        this.rondar(a, deltaMs);
        a.sprite.setVisible(true).setDepth(profundidadeNoMundo(a.sprite.y + 14));
        continue;
      }
      if (a.lugarAtual === -2) a.lugarAtual = -1; // acabou a ronda: volta à rotina
      const indice = this.lugarDaHora(def);
      if (indice !== a.lugarAtual) {
        // Mudou de lugar na rotina: aparece lá (sem atravessar o mapa a pé)
        const lugar = def.rotina[indice][1];
        a.lugarAtual = indice;
        a.sala = lugar.sala;
        a.base = this.pontoDo(lugar);
        a.destino = { ...a.base };
        a.sprite.setPosition(a.base.x, a.base.y - 14);
      }
      this.passear(a, deltaMs);
      a.sprite.setDepth(profundidadeNoMundo(a.sprite.y + 14));
    }
  }

  private rondar(a: AldeaoNaTela, deltaMs: number) {
    if (a.lugarAtual !== -2) {
      a.lugarAtual = -2;
      a.sala = 'fora';
      const inicio = this.mundo.mapa.centroDaCelula(RONDA[this.passoDaRonda]);
      a.sprite.setPosition(inicio.x, inicio.y - 14);
    }
    const alvo = this.mundo.mapa.centroDaCelula(RONDA[this.passoDaRonda]);
    const dx = alvo.x - a.sprite.x;
    const dy = alvo.y - 14 - a.sprite.y;
    const distancia = Math.hypot(dx, dy);
    const passo = (VELOCIDADE * 1.6 * deltaMs) / 1000;
    if (distancia <= passo) {
      this.passoDaRonda = (this.passoDaRonda + 1) % RONDA.length;
      return;
    }
    a.sprite.setPosition(a.sprite.x + (dx / distancia) * passo, a.sprite.y + (dy / distancia) * passo);
    const direcao = Math.abs(dx) > Math.abs(dy) ? 'lado' : dy < 0 ? 'cima' : 'baixo';
    a.sprite.setFlipX(direcao === 'lado' && dx > 0);
    a.sprite.anims.play(animacaoAndar(direcao), true);
  }

  // Anda devagar em volta do lugar (fora, até uma célula para cada lado; dentro, parado)
  private passear(a: AldeaoNaTela, deltaMs: number) {
    if (a.espera > 0) {
      a.espera -= deltaMs;
      return;
    }
    const alvoY = a.destino.y - 14;
    const dx = a.destino.x - a.sprite.x;
    const dy = alvoY - a.sprite.y;
    const distancia = Math.hypot(dx, dy);
    const passo = (VELOCIDADE * deltaMs) / 1000;
    if (distancia <= passo) {
      a.sprite.setPosition(a.destino.x, alvoY);
      a.sprite.anims.stop();
      a.sprite.setFrame(quadroParado('baixo'));
      a.espera = 2000 + Math.random() * 4000;
      const alcance = a.sala === 'fora' ? TAMANHO_CELULA : 0;
      a.destino = { x: a.base.x + (Math.random() * 2 - 1) * alcance, y: a.base.y + (Math.random() * 2 - 1) * alcance };
      return;
    }
    a.sprite.setPosition(a.sprite.x + (dx / distancia) * passo, a.sprite.y + (dy / distancia) * passo);
    const direcao = Math.abs(dx) > Math.abs(dy) ? 'lado' : dy < 0 ? 'cima' : 'baixo';
    a.sprite.setFlipX(direcao === 'lado' && dx > 0);
    a.sprite.anims.play(animacaoAndar(direcao), true);
  }

  // Quem está acordado, na mesma sala (ou fora) e perto do Tomás: vê o que ele faz
  // (na forma de névoa ninguém o vê; neblina e tempestade encurtam a vista)
  testemunhas(): IdAldeao[] {
    if (this.mundo.vampiro.nevoaRestante > 0) return [];
    const raio = raioDeVisao(this.mundo.clima);
    const pes = this.jogador.celulaDosPes;
    return this.naTela
      .filter((a) => this.mundo.relacoes.vivo(a.id) && !this.dormindo(a.id) && a.sala === this.interiores.local)
      .filter((a) => {
        const dx = Math.floor(a.sprite.x / TAMANHO_CELULA) - pes.coluna;
        const dy = Math.floor((a.sprite.y + 14) / TAMANHO_CELULA) - pes.linha;
        return Math.hypot(dx, dy) <= raio;
      })
      .map((a) => a.id);
  }

  // Na investigação, o Orlando ronda à noite em vez de ir para casa
  private emRonda(id: IdAldeao): boolean {
    const hora = this.mundo.relogio.hora;
    return id === 'orlando' && nivel(this.mundo.suspeita) >= 3 && (hora >= RONDA_COMECA || hora < RONDA_TERMINA);
  }

  // À noite, na própria casa (o primeiro lugar da rotina), o aldeão está dormindo
  private dormindo(id: IdAldeao): boolean {
    const casa = (ALDEOES[id] as DefinicaoDeAldeao).rotina[0][1].sala;
    return this.mundo.relogio.eNoite && casa !== 'fora' && this.salaDe(id) === casa;
  }

  private abrirMordida(id: IdAldeao) {
    const { menu, vampiro, relacoes, missoes, avisos, relogio } = this.mundo;
    const def: DefinicaoDeAldeao = ALDEOES[id];
    menu.abrir(() => {
      const vendo = this.testemunhas().map((t) => (ALDEOES[t] as DefinicaoDeAldeao).nome);
      return `${def.nome} dorme.${vendo.length ? `  Cuidado: ${vendo.join(', ')} pode ver!` : ' A respiração é lenta.'}`;
    }, () => [
      {
        texto: 'Beber um pouco',
        detalhe: ALIMENTOS.aldeaoPouco.descricao + (vampiro.tem('hipnose') ? ' Com a hipnose, não vai lembrar de nada.' : ' Sem hipnose, vai lembrar e perder a confiança em você.'),
        aoEscolher: () => {
          registrarMordida(this.mundo);
          avisos.mostrar(beber(vampiro, 'aldeaoPouco', def.nome).aviso);
          relacoes.fracoNoDia[id] = relogio.dia + (relogio.hora >= 6 ? 1 : 0);
          if (!vampiro.tem('hipnose')) {
            relacoes.somar(id, -30);
            vampiro.registro.push(`testemunha:${id}`);
          }
          return 'fechar' as const;
        },
      },
      {
        texto: 'Beber até o fim',
        detalhe: `${ALIMENTOS.aldeaoFim.descricao} Você nunca mais vai ver ${def.nome}.`,
        aoEscolher: () => {
          registrarMordida(this.mundo);
          avisos.mostrar(beber(vampiro, 'aldeaoFim', def.nome).aviso);
          registrarMorte(relacoes, id);
          for (const m of missoes.ativas()) if (MISSOES[m].aldeao === id) delete missoes.situacao[m];
          vampiro.registro.push(`desaparecido:${id}`);
          avisos.mostrar(`${def.nome} não vai acordar. A vila inteira vai sentir.`);
          return 'fechar' as const;
        },
      },
      { texto: 'Sair de fininho', aoEscolher: () => 'fechar' as const },
    ]);
  }

  private abrirConversa(id: IdAldeao) {
    if (this.dormindo(id)) {
      this.abrirMordida(id);
      return;
    }
    const { menu, relacoes, missoes, inventario, avisos, relogio } = this.mundo;
    const def: DefinicaoDeAldeao = ALDEOES[id];
    const falar = (falas: string[], depois?: () => void) => this.dialogo.falar(def.nome, def.cor, falas, depois);

    menu.abrir(
      () => `${def.nome}   ${'♥'.repeat(relacoes.coracoes(id))}`,
      () => {
        const opcoes: { texto: string; detalhe?: string; ativa?: boolean; aoEscolher: () => void | 'fechar' }[] = [
          {
            texto: 'Conversar',
            aoEscolher: () => {
              const fraco = relacoes.fracoNoDia[id] === relogio.dia;
              const recusa = nivel(this.mundo.suspeita) >= 2 && relacoes.coracoes(id) < 3;
              if (recusa) {
                falar(['Não tenho nada pra falar com você.']);
                return 'fechar';
              }
              const fala = fraco ? 'Acordei tão fraco hoje... e com duas marquinhas no pescoço. Mosquito, deve ser.' : conversar(relacoes, id, relogio.dia);
              const sinal = sinalVisivel(this.mundo.vampiro, relogio.dia);
              if (sinal) this.mundo.vampiro.registro.push(`sinal:${id}`);
              falar(sinal ? [`(${def.nome} repara em você: ${sinal.toLowerCase()}.) Você tá bem? Tá com uma cara...`, fala] : [fala]);
              return 'fechar';
            },
          },
        ];
        const nova = def.principal ? missaoDisponivel(missoes, relacoes, id) : null;
        if (nova) {
          const m: DefinicaoDeMissao = MISSOES[nova];
          opcoes.push({
            texto: `Pedido: ${m.titulo}`,
            detalhe: `Levar ${textoDoPedido(nova)}. Recompensa: ${m.moedas} moedas.`,
            aoEscolher: () => {
              falar([m.pedido], () => avisos.mostrar(aceitar(missoes, nova).aviso));
              return 'fechar';
            },
          });
        }
        const ativa = missaoAtiva(missoes, id);
        if (ativa) {
          const m: DefinicaoDeMissao = MISSOES[ativa];
          opcoes.push({
            texto: `Entregar: ${m.titulo}`,
            detalhe: `Precisa de ${textoDoPedido(ativa)}.`,
            ativa: podeEntregar(ativa, inventario),
            aoEscolher: () => {
              const entrega = entregar(missoes, ativa, inventario, relacoes);
              avisos.mostrar(entrega.aviso);
              if (entrega.mudou) avisos.mostrar(somarSuspeita(this.mundo.suspeita, SUSPEITA.missaoConcluida));
              falar([m.agradecimento], () => m.pista && anotarPista(this.mundo, m.pista));
              return 'fechar';
            },
          });
        }
        const item = inventario.itemNaMao;
        if (item) {
          opcoes.push({
            texto: `Dar de presente: ${nomeDoItem(item).toLowerCase()}`,
            detalhe: 'Um presente por dia. Cada um tem seus gostos.',
            aoEscolher: () => {
              const presente = presentear(relacoes, id, inventario);
              avisos.mostrar(presente.aviso);
              if (presente.mudou) somarSuspeita(this.mundo.suspeita, SUSPEITA.presente);
              return 'fechar';
            },
          });
        }
        const { suspeita } = this.mundo;
        if (id === 'rosalia' && suspeita.valor >= 20 && suspeita.culpouOLoboNoDia !== relogio.dia) {
          opcoes.push({
            texto: 'Comentar sobre pegadas de lobo',
            detalhe: 'A Rosália espalha qualquer história. Uma por dia.',
            aoEscolher: () => {
              suspeita.culpouOLoboNoDia = relogio.dia;
              falar(['Pegadas enormes perto do rio? Então é lobo mesmo! Vou contar pra todo mundo.'], () =>
                avisos.mostrar(somarSuspeita(suspeita, SUSPEITA.culparOLobo) ?? 'A história do lobo corre pela vila.'),
              );
              return 'fechar';
            },
          });
        }
        opcoes.push({ texto: 'Tchau', aoEscolher: () => 'fechar' });
        return opcoes;
      },
    );
  }
}
