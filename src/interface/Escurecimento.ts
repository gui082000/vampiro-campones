import type Phaser from 'phaser';
import { CAMADA } from '../arte/Camadas';
import { ALTURA, ESCURIDAO_MAXIMA, HORA_AMANHECER, HORA_ANOITECER, LARGURA } from '../config';

// Devolve de 0 a 1 o quanto está escuro naquela hora. A luz começa a cair 2 horas
// antes do anoitecer e some 1 hora depois; de manhã, clareia de 1 hora antes do
// amanhecer até 2 horas depois.
function escuridaoDaHora(hora: number): number {
  const comecaEscurecer = HORA_ANOITECER - 2;
  const noiteFechada = HORA_ANOITECER + 1;
  const comecaClarear = HORA_AMANHECER - 1;
  const diaClaro = HORA_AMANHECER + 2;

  if (hora >= diaClaro && hora < comecaEscurecer) return 0;
  if (hora >= comecaEscurecer && hora < noiteFechada) {
    return (hora - comecaEscurecer) / (noiteFechada - comecaEscurecer);
  }
  if (hora >= noiteFechada || hora < comecaClarear) return 1;
  return 1 - (hora - comecaClarear) / (diaClaro - comecaClarear);
}

// Camada escura por cima do mundo que acompanha a hora do dia.
export class Escurecimento {
  private camada: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene) {
    // A cor é opaca e quem controla o quanto escurece é o alpha do objeto. (Com a cor
    // transparente, o Phaser multiplica os dois e a noite nunca aparece.)
    this.camada = scene.add
      .rectangle(0, 0, LARGURA, ALTURA, 0x0a0a2a)
      .setAlpha(0)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(CAMADA.noite);
  }

  atualizar(hora: number) {
    this.camada.setAlpha(escuridaoDaHora(hora) * ESCURIDAO_MAXIMA);
  }
}
