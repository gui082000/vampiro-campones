import {
  HORA_AMANHECER,
  HORA_ANOITECER,
  HORA_INICIAL,
  HORA_NOVO_DIA,
  SEGUNDOS_POR_HORA,
} from '../config';
import type { Estacao } from '../dados/estacoes';
import { estacaoDoDia } from '../estado/Calendario';
import { Eventos } from '../util/Eventos';

type EventosDoRelogio = {
  // Um pedaço de tempo passou (nunca atravessa um marco: é todo de dia ou todo de noite)
  passou: [horas: number, eNoite: boolean];
  'novo-dia': [dia: number];
  amanheceu: [];
  anoiteceu: [];
};

const MARCOS = [HORA_NOVO_DIA, HORA_AMANHECER, HORA_ANOITECER];

// Controla a hora e o dia do jogo. Não desenha nada: o escurecimento e o HUD leem
// daqui. Quem precisa do tempo escuta os eventos com relogio.ouvir(...): 'passou'
// (para crescer, ter fome...) e os marcos 'novo-dia', 'amanheceu' e 'anoiteceu'.
export class Relogio extends Eventos<EventosDoRelogio> {
  hora = HORA_INICIAL;
  dia = 1;

  get eNoite(): boolean {
    return this.hora >= HORA_ANOITECER || this.hora < HORA_AMANHECER;
  }

  get estacao(): Estacao {
    return estacaoDoDia(this.dia);
  }

  // Hora no formato de relógio, ex.: "07:30"
  get horario(): string {
    const h = Math.floor(this.hora);
    const m = Math.floor((this.hora - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // Faz o tempo andar `deltaMs` milissegundos reais e devolve quantas horas do jogo
  // passaram. Anda em pedaços que param em cada marco, para avisar cada um na ordem
  // certa mesmo num salto grande (ex.: dormir até de manhã).
  avancar(deltaMs: number): number {
    const horasPassadas = deltaMs / 1000 / SEGUNDOS_POR_HORA;
    this.andar(horasPassadas);
    return horasPassadas;
  }

  // Pula até a próxima vez que o relógio marcar essa hora (ex.: dormir até as 6h)
  avancarAte(hora: number) {
    const falta = (hora - this.hora + 24) % 24 || 24;
    this.andar(falta);
  }

  private andar(horas: number) {
    let restante = horas;
    while (restante > 1e-9) {
      const { marco, falta } = this.proximoMarco();
      // Chega no marco se o que falta andar cobre a distância até ele (com uma folga
      // mínima, porque somar frações de hora sempre deixa um errinho de arredondamento)
      const chegou = restante >= falta - 1e-9;
      const passo = chegou ? falta : restante;
      const eNoite = this.eNoite;
      // Ao chegar, usa a hora exata do marco
      this.hora = chegou ? marco : (this.hora + passo) % 24;
      restante -= passo;
      this.emitir('passou', passo, eNoite);
      if (chegou) this.chegarNoMarco();
    }
  }

  private proximoMarco(): { marco: number; falta: number } {
    let proximo = { marco: MARCOS[0], falta: Infinity };
    for (const marco of MARCOS) {
      const falta = (marco - this.hora + 24) % 24 || 24;
      if (falta < proximo.falta) proximo = { marco, falta };
    }
    return proximo;
  }

  private chegarNoMarco() {
    if (this.hora === HORA_NOVO_DIA) {
      this.dia += 1;
      this.emitir('novo-dia', this.dia);
    }
    if (this.hora === HORA_AMANHECER) this.emitir('amanheceu');
    if (this.hora === HORA_ANOITECER) this.emitir('anoiteceu');
  }
}
