import { FOME_ALTA, MULTIPLICADOR_VELOCIDADE_FOME, MULTIPLICADOR_VELOCIDADE_NOITE, VELOCIDADE_CARREGANDO_CORPO } from '../config';
import { fecharDia, passarTempo, queimarNoAmanhecer } from '../estado/Vampiro';
import type { IdFinal } from '../dados/historia';
import type { Interiores } from './Interiores';
import type { Jogador } from './Jogador';
import type { Mundo } from './Mundo';

const TOM_DA_NOITE = 0xffb0b0; // o Tomás fica com a pele mais vermelha à noite

// A maldição no dia a dia: a fome sobe com o tempo; à noite o Tomás fica mais rápido e
// enxerga no escuro; com fome alta fica lento; o sol forte cansa quem tem fome; amanhecer
// fora de casa queima; dois dias inteiros com fome no limite é o fim.
export class Vampirismo {
  private mundo: Mundo;
  private jogador: Jogador;

  constructor(mundo: Mundo, jogador: Jogador, interiores: Interiores, terminar: (final: IdFinal) => void) {
    this.mundo = mundo;
    this.jogador = jogador;
    const { relogio, vampiro, energia, avisos } = mundo;

    relogio.ouvir('passou', (horas, eNoite) =>
      passarTempo(vampiro, horas, eNoite, { hora: relogio.hora, dia: relogio.dia, foraDeCasa: interiores.local === 'fora', energia }),
    );
    relogio.ouvir('anoiteceu', () => avisos.mostrar('A noite caiu. A fome desperta.'));
    relogio.ouvir('amanheceu', () => {
      if (interiores.local === 'fora') avisos.mostrar(queimarNoAmanhecer(vampiro, energia).aviso);
    });
    relogio.ouvir('novo-dia', () => {
      if (fecharDia(vampiro)) {
        terminar('fome');
      } else if (vampiro.diasNoLimite > 0) {
        avisos.mostrar('Você mal se aguenta de fome. Mais um dia assim e não haverá volta.');
      }
    });
  }

  // Quanto a noite escurece a tela para ele (1 = normal)
  get visao(): number {
    if (!this.mundo.relogio.eNoite) return 1;
    return this.mundo.vampiro.tem('visaoNoturna') ? 0.25 : 0.6;
  }

  atualizar() {
    const { relogio, vampiro } = this.mundo;
    let multiplicador = 1;
    if (relogio.eNoite) multiplicador *= MULTIPLICADOR_VELOCIDADE_NOITE * (vampiro.tem('velocidade') ? 1.25 : 1);
    if (vampiro.fome >= FOME_ALTA) multiplicador *= MULTIPLICADOR_VELOCIDADE_FOME;
    if (this.mundo.suspeita.carregando) multiplicador *= VELOCIDADE_CARREGANDO_CORPO;
    this.jogador.multiplicadorDeVelocidade = multiplicador;
    if (relogio.eNoite) this.jogador.sprite.setTint(TOM_DA_NOITE);
    else this.jogador.sprite.clearTint();
  }
}
