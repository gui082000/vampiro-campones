import { SONS, type NomeDoSom, type Nota } from '../dados/sons';

// Toca os sons do jogo pelo Web Audio do navegador. Sem navegador (testes) ou com
// volume 0, não faz nada.
let contexto: AudioContext | null = null;
let volume = 0.8;

export function definirVolume(porcento: number) {
  volume = Math.max(0, Math.min(1, porcento / 100));
}

export function tocarSom(nome: NomeDoSom) {
  if (volume <= 0 || typeof window === 'undefined' || !('AudioContext' in window)) return;
  try {
    contexto ??= new AudioContext();
    if (contexto.state === 'suspended') void contexto.resume();
    let inicio = contexto.currentTime;
    for (const nota of SONS[nome] as Nota[]) {
      tocarNota(contexto, nota, inicio);
      inicio += nota.dur;
    }
  } catch {
    // sem som neste navegador: o jogo segue mudo
  }
}

function tocarNota(ctx: AudioContext, nota: Nota, inicio: number) {
  const ganho = ctx.createGain();
  const vol = (nota.vol ?? 0.15) * volume;
  ganho.gain.setValueAtTime(vol, inicio);
  ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + nota.dur);
  ganho.connect(ctx.destination);

  let fonte: AudioScheduledSourceNode;
  if (nota.freq === 0) {
    // ruído (mordida, trovão)
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * nota.dur), ctx.sampleRate);
    const dados = buffer.getChannelData(0);
    for (let i = 0; i < dados.length; i++) dados[i] = Math.random() * 2 - 1;
    const ruido = ctx.createBufferSource();
    ruido.buffer = buffer;
    fonte = ruido;
  } else {
    const osc = ctx.createOscillator();
    osc.type = nota.onda ?? 'sine';
    osc.frequency.setValueAtTime(nota.freq, inicio);
    if (nota.ate) osc.frequency.exponentialRampToValueAtTime(nota.ate, inicio + nota.dur);
    fonte = osc;
  }
  fonte.connect(ganho);
  fonte.start(inicio);
  fonte.stop(inicio + nota.dur);
}
