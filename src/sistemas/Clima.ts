import type Phaser from 'phaser';
import { profundidadeNoMundo } from '../arte/Camadas';
import { CLIMA } from '../config';
import { ALDEOES, type IdAldeao } from '../dados/aldeoes';
import { HORARIO_DO_FESTIVAL, LUGAR_DO_FESTIVAL, TEMPOS } from '../dados/clima';
import { nomeDoItem } from '../dados/itens';
import { chove, festivalDoDia, sortearEvento, sortearTempo } from '../estado/Clima';
import { estacaoDoDia } from '../estado/Calendario';
import { somarSuspeita } from '../estado/Suspeita';
import type { Fazenda } from './Fazenda';
import { TAMANHO_CELULA } from './Mapa';
import type { Mundo } from './Mundo';

// O céu de cada dia: sorteia o tempo na virada do dia (a chuva rega a plantação),
// às vezes acontece algo pequeno de manhã, e uma vez por estação há festa na vila.
export class Clima {
  aleatorio: () => number = Math.random; // os testes podem trocar
  private mundo: Mundo;
  private enfeite: Phaser.GameObjects.Graphics;

  constructor(mundo: Mundo, fazenda: Fazenda) {
    this.mundo = mundo;
    const { relogio, clima, avisos, cena, mapa } = mundo;

    relogio.ouvir('novo-dia', (dia) => {
      clima.tempo = sortearTempo(estacaoDoDia(dia), this.aleatorio);
      if (chove(clima)) fazenda.regarTudo();
    });
    relogio.ouvir('amanheceu', () => {
      if (TEMPOS[clima.tempo].aviso) avisos.mostrar(TEMPOS[clima.tempo].aviso);
      const festival = festivalDoDia(relogio.dia);
      if (festival) avisos.mostrar(festival.convite);
      else this.aconteceAlgo();
    });

    // A festa: um mastro enfeitado na frente da igreja
    const { x, y } = mapa.centroDaCelula(LUGAR_DO_FESTIVAL);
    this.enfeite = cena.add.graphics({ x, y }).setDepth(profundidadeNoMundo(y + 14));
    this.enfeite.fillStyle(0x6a4a2a).fillRect(-2, -34, 4, 48);
    const cores = [0xd04040, 0xe0c040, 0x4a8ad0, 0x50a060];
    cores.forEach((cor, i) => this.enfeite.lineStyle(2, cor).lineBetween(0, -34, -16 + i * 11, 10));
    this.enfeite.fillStyle(0xffa030, 0.9).fillCircle(0, 16, 5);
    mundo.interacao.registrar({
      x,
      y,
      largura: TAMANHO_CELULA,
      altura: TAMANHO_CELULA,
      ativo: () => this.festaAberta(),
      dica: () => `${festivalDoDia(relogio.dia)!.nome} · E: participar`,
      acao: () => this.participar(),
    });
  }

  private festaAberta(): boolean {
    const { relogio, clima } = this.mundo;
    const [abre, fecha] = HORARIO_DO_FESTIVAL;
    return !!festivalDoDia(relogio.dia) && !clima.festivaisFeitos.includes(relogio.dia) && relogio.hora >= abre && relogio.hora < fecha;
  }

  private participar() {
    const { relogio, clima, relacoes, suspeita, inventario, avisos } = this.mundo;
    const festival = festivalDoDia(relogio.dia)!;
    clima.festivaisFeitos.push(relogio.dia);
    for (const id of Object.keys(ALDEOES) as IdAldeao[]) if (relacoes.vivo(id)) relacoes.somar(id, CLIMA.festivalAmizade);
    inventario.adicionar(festival.presente.id, festival.presente.qtd);
    avisos.mostrar(festival.participar);
    avisos.mostrar(`Ganhou ${festival.presente.qtd}x ${nomeDoItem(festival.presente.id).toLowerCase()}. A vila gosta mais de você.`);
    avisos.mostrar(somarSuspeita(suspeita, CLIMA.festivalSuspeita));
  }

  // Um evento pequeno, sorteado de manhã
  private aconteceAlgo() {
    const { vampiro, inventario, energia, suspeita, avisos } = this.mundo;
    const evento = sortearEvento(this.aleatorio, vampiro.jaMordeu);
    if (!evento) return;
    avisos.mostrar(evento.texto);
    if (evento.moedas) inventario.moedas += evento.moedas;
    if (evento.energia) energia.atual = Math.max(0, Math.min(energia.maxima, energia.atual + evento.energia));
    if (evento.item) inventario.adicionar(evento.item.id, evento.item.qtd);
    if (evento.suspeita) avisos.mostrar(somarSuspeita(suspeita, evento.suspeita));
  }

  atualizar() {
    this.enfeite.setVisible(this.festaAberta());
  }
}
