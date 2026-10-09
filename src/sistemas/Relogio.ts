import {
  HORA_AMANHECER,
  HORA_ANOITECER,
  HORA_INICIAL,
  HORA_NOVO_DIA,
  SEGUNDOS_POR_HORA,
} from '../config';
import { Eventos } from '../util/Eventos';

type EventosDoRelogio = {
  'novo-dia': [dia: number];
  amanheceu: [];
  anoiteceu: [];
};

// Diz se a hora `marco` ficou para trás ao andar de `antes` até `depois`
// (`depois` pode passar de 24 quando o passo atravessa a meia-noite).
function cruzou(antes: number, depois: number, marco: number): boolean {
  return (antes < marco && depois >= marco) || (antes < marco + 24 && depois >= marco + 24);
}

// Controla a hora e o dia do jogo. Não desenha nada: o escurecimento e o HUD leem
// daqui, e quem precisa reagir aos marcos do dia escuta os eventos 'novo-dia',
// 'amanheceu' e 'anoiteceu' com relogio.ouvir(...).
export class Relogio extends Eventos<EventosDoRelogio> {
  hora = HORA_INICIAL;
  dia = 1;

  get eNoite(): boolean {
    return this.hora >= HORA_ANOITECER || this.hora < HORA_AMANHECER;
  }

  // Hora no formato de relógio, ex.: "07:30"
  get horario(): string {
    const h = Math.floor(this.hora);
    const m = Math.floor((this.hora - h) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  // Faz o tempo andar `deltaMs` milissegundos reais e devolve quantas horas do jogo
  // passaram. Anda no máximo 1 hora por vez, para avisar cada marco uma vez e na
  // ordem certa mesmo num salto grande (ex.: dormir até de manhã).
  avancar(deltaMs: number): number {
    const horasPassadas = deltaMs / 1000 / SEGUNDOS_POR_HORA;
    for (let restante = horasPassadas; restante > 0; restante -= 1) {
      this.andar(Math.min(restante, 1));
    }
    return horasPassadas;
  }

  private andar(horas: number) {
    const antes = this.hora;
    const depois = antes + horas;
    this.hora = depois % 24;

    if (cruzou(antes, depois, HORA_NOVO_DIA)) {
      this.dia += 1;
      this.emitir('novo-dia', this.dia);
    }
    if (cruzou(antes, depois, HORA_AMANHECER)) this.emitir('amanheceu');
    if (cruzou(antes, depois, HORA_ANOITECER)) this.emitir('anoiteceu');
  }
}
