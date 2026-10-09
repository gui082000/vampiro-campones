// Teste do jogo de verdade, no navegador: abre o jogo no Edge sem janela, segue um
// roteiro de teclas, mostra o estado do jogo e tira fotos da tela.
//
// Precisa do jogo rodando em modo de desenvolvimento (npm run dev), porque usa o
// gancho window.jogo criado em src/main.ts só nesse modo.
//
// Uso: node ferramentas/verificar-jogo.mjs ferramentas/roteiros/fase0.json [pasta_saida] [url]
// As fotos vão para ferramentas/saida/<nome do roteiro>/ (fora do Git).
//
// O jogo é avançado quadro a quadro pelo próprio roteiro (jogo.loop.sleep + jogo.step),
// então o resultado não depende de quantos quadros por segundo o navegador consegue.
//
// Passos do roteiro (arquivo JSON com uma lista):
//   {"foto": "nome"}                 tira uma foto da tela
//   {"andar": "a", "ate": 102}       segura a tecla até chegar na coluna/linha (em células)
//   {"apertar": "e"}                 aperta e solta uma tecla (a, s, d, w, e, 1, 2, 3)
//   {"esperar": 500}                 deixa o jogo correr esse tempo (em ms do jogo)
//   {"js": "expressão", "rotulo": "texto"}  roda código na página e mostra o resultado
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';

const [, , roteiroArq, saidaArg, url = 'http://localhost:5173/'] = process.argv;
if (!roteiroArq) {
  console.log('Uso: node ferramentas/verificar-jogo.mjs <roteiro.json> [pasta_saida] [url]');
  process.exit(1);
}
const roteiro = JSON.parse(readFileSync(roteiroArq, 'utf8'));
// caminho absoluto: o navegador não aceita a pasta de perfil com caminho relativo
const saida = resolve(saidaArg ?? join('ferramentas', 'saida', basename(roteiroArq, '.json')));
mkdirSync(saida, { recursive: true });

const PORTA = 9333;
const NAVEGADOR = process.env.NAVEGADOR ?? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const navegador = spawn(
  NAVEGADOR,
  [
    '--headless=new',
    `--remote-debugging-port=${PORTA}`,
    `--user-data-dir=${join(saida, 'perfil-navegador')}`,
    '--window-size=800,600',
    '--no-first-run',
    '--no-default-browser-check',
    '--enable-unsafe-swiftshader',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function enderecoDaPagina() {
  for (let i = 0; i < 75; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${PORTA}/json/list`)).json();
      const pagina = lista.find((t) => t.type === 'page');
      if (pagina) return pagina.webSocketDebuggerUrl;
    } catch {}
    await esperar(200);
  }
  throw new Error('O navegador não abriu');
}

const ws = new WebSocket(await enderecoDaPagina());
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

let proximoId = 0;
const pendentes = new Map();
const mensagens = [];
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pendentes.has(msg.id)) {
    pendentes.get(msg.id)(msg);
    pendentes.delete(msg.id);
    return;
  }
  const p = msg.params;
  if (msg.method === 'Runtime.consoleAPICalled') {
    mensagens.push(`[console.${p.type}] ` + p.args.map((a) => a.value ?? a.description).join(' '));
  } else if (msg.method === 'Runtime.exceptionThrown') {
    mensagens.push('[ERRO] ' + (p.exceptionDetails.exception?.description ?? p.exceptionDetails.text));
  } else if (msg.method === 'Log.entryAdded' && !p.entry.text.includes('ReadPixels')) {
    // (os avisos de ReadPixels vêm das próprias fotos, não do jogo)
    mensagens.push(`[log.${p.entry.level}] ${p.entry.text} ${p.entry.url ?? ''}`);
  }
});

function cdp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++proximoId;
    pendentes.set(id, (m) => (m.error ? reject(new Error(`${method}: ${m.error.message}`)) : resolve(m.result)));
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function avaliar(expressao) {
  const { result, exceptionDetails } = await cdp('Runtime.evaluate', {
    returnByValue: true,
    awaitPromise: true,
    expression: expressao,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? exceptionDetails.text);
  return result.value;
}

const TECLAS = {
  a: ['KeyA', 65], s: ['KeyS', 83], d: ['KeyD', 68], w: ['KeyW', 87], e: ['KeyE', 69],
  1: ['Digit1', 49], 2: ['Digit2', 50], 3: ['Digit3', 51],
};

async function tecla(t, tipo) {
  const [code, codigo] = TECLAS[t];
  await cdp('Input.dispatchKeyEvent', {
    type: tipo, key: String(t), code, windowsVirtualKeyCode: codigo, nativeVirtualKeyCode: codigo,
  });
}

// Avança o jogo n quadros de 1/60 s
const passos = (n) => avaliar(`__passos(${Math.max(1, Math.round(n))})`);

async function apertar(t) {
  await tecla(t, 'keyDown');
  await passos(2);
  await tecla(t, 'keyUp');
  await passos(2);
}

// Segura a tecla, quadro a quadro, até o Tomás chegar na coordenada (em células)
// daquele eixo, ou até ficar parado (bateu em algo)
async function andar(t, alvo) {
  const eixo = t === 'a' || t === 'd' ? 0 : 1;
  const sinal = t === 'a' || t === 'w' ? -1 : 1;
  await tecla(t, 'keyDown');
  const r = await avaliar(`(() => {
    const j = jogo.scene.getScene('CenaPrincipal').jogador;
    const pos = () => [j.x / 32, j.y / 32];
    let quadros = 0, parado = 0, ultimo = pos()[${eixo}];
    while (quadros < 1200 && (${alvo} - pos()[${eixo}]) * ${sinal} > 0.03) {
      __passos(1);
      quadros++;
      const agora = pos()[${eixo}];
      parado = Math.abs(agora - ultimo) < 0.001 ? parado + 1 : 0;
      ultimo = agora;
      if (parado > 20) break;
    }
    return { p: pos(), quadros, bloqueado: { ...j.sprite.body.blocked } };
  })()`);
  await tecla(t, 'keyUp');
  await passos(3);
  const ok = (alvo - r.p[eixo]) * sinal <= 0.25;
  const onde = `(${r.p[0].toFixed(2)}, ${r.p[1].toFixed(2)})`;
  console.log(`andar ${t} até ${alvo}: ${ok ? 'ok' : 'TRAVOU'} em ${onde} após ${r.quadros} quadros`);
  if (!ok) console.log('  bloqueado:', JSON.stringify(r.bloqueado));
  return ok;
}

async function foto(nome) {
  await passos(1);
  const { data } = await cdp('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(saida, `${nome}.png`), Buffer.from(data, 'base64'));
}

let falhou = false;
try {
  await cdp('Runtime.enable');
  await cdp('Log.enable');
  await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride', { width: 800, height: 600, deviceScaleFactor: 1, mobile: false });
  await cdp('Emulation.setFocusEmulationEnabled', { enabled: true });
  await cdp('Page.navigate', { url });

  // Espera o jogo terminar de carregar e assume o controle dos quadros
  let pronto = false;
  for (let i = 0; i < 60 && !pronto; i++) {
    pronto = await avaliar(`typeof jogo !== 'undefined' && !!jogo.scene.getScene('CenaPrincipal')?.jogador`)
      .catch(() => false);
    if (!pronto) await esperar(250);
  }
  if (!pronto) throw new Error('O jogo não carregou (o npm run dev está rodando?)');
  await avaliar(`(() => {
    jogo.loop.sleep();
    let t = performance.now();
    window.__passos = (n) => { for (let i = 0; i < n; i++) { t += 1000 / 60; jogo.step(t, 1000 / 60); } };
  })()`);

  for (const passo of roteiro) {
    if (passo.foto) await foto(passo.foto);
    else if (passo.apertar) await apertar(passo.apertar);
    else if (passo.esperar) await passos(passo.esperar / (1000 / 60));
    else if (passo.andar) falhou = !(await andar(passo.andar, passo.ate)) || falhou;
    else if (passo.js) console.log(`${passo.rotulo ?? 'js'}: ${JSON.stringify(await avaliar(passo.js))}`);
  }
} catch (erro) {
  falhou = true;
  console.log('[ERRO NO ROTEIRO]', erro.message);
} finally {
  const relevantes = mensagens.filter((m) => !m.includes('[vite]') && !m.includes('Phaser v'));
  console.log(relevantes.length ? relevantes.join('\n') : '(nenhum erro ou aviso no console)');
  console.log(`fotos em: ${saida}`);
  ws.close();
  navegador.kill();
  if (falhou || relevantes.some((m) => m.startsWith('[ERRO]'))) process.exitCode = 1;
}
