# Sangue na Terra

Jogo 2D de fazenda e sobrevivência com um camponês vampiro, no espírito de Stardew Valley e
Graveyard Keeper. De dia o Tomás planta, pesca, cria animais e faz amizade com a vila. À noite a
fome desperta, e ele precisa se alimentar sem que a vila descubra quem ele é. Há uma história em
três atos e sete finais.

Feito com Phaser 4, TypeScript e Vite. Os textos estão em português do Brasil.

## Como rodar

Precisa do [Node.js](https://nodejs.org) (versão 20 ou mais nova).

```bash
npm install      # uma vez só
npm run dev      # abre o jogo em http://localhost:5173
```

## Como publicar

```bash
npm run build    # gera a pasta dist/
npm run preview  # testa a versão publicada em http://localhost:4173
```

A pasta `dist/` é o jogo pronto. Ela funciona em qualquer servidor de arquivos, como o
itch.io (em formato HTML, enviando o `.zip` da pasta) ou o GitHub Pages.

## Controles

| Tecla | Ação |
| --- | --- |
| WASD ou setas | andar |
| E | usar o que está à frente / confirmar |
| 1 a 8 ou rodinha do mouse | escolher o item da mão |
| F | comer (ou usar um item do vampiro) |
| I | inventário |
| J | diário (missões, aldeões, pistas e finais) |
| V | virar névoa (poder do altar) |
| B | voar como morcego (poder do altar) |
| Esc | pausa: salvar, carregar, opções |

À noite, aperte E num aldeão que dorme para morder. O jogo salva sozinho toda manhã.

## Testes

```bash
npm test                                                      # testes das regras (Vitest)
node ferramentas/verificar-jogo.mjs ferramentas/roteiros/fase8.json   # joga no navegador (com npm run dev rodando)
```

O teste no navegador usa o Microsoft Edge sem janela. Ele segue um roteiro de teclas e guarda
fotos da tela em `ferramentas/saida/`.

## Organização

| Pasta | O que tem |
| --- | --- |
| `src/dados` | o conteúdo: itens, plantas, aldeões, missões, história, clima, sons... |
| `src/config.ts` | os números gerais de balanceamento (tempo, fome, suspeita...) |
| `src/estado` | as regras do jogo, sem desenho, fáceis de salvar e testar |
| `src/sistemas` | as regras ligadas à tela (Phaser), um arquivo por responsabilidade |
| `src/interface` | HUD, menus, diálogos e telas |
| `src/arte` | arte provisória desenhada por código |
| `src/util/Som.ts` | sons provisórios: o jogo chama `tocarSom('nome')` |
| `testes` | testes automáticos |
| `ferramentas` | o teste no navegador e os roteiros de cada fase |

As decisões de design de cada fase estão em [GAME_DESIGN.md](GAME_DESIGN.md).

## Trocar a arte ou os sons

- **Sons:** troque `src/util/Som.ts` por um carregador de arquivos. Os nomes dos sons ficam em
  `src/dados/sons.ts`, e o resto do jogo não muda.
- **Arte:** os desenhos provisórios ficam em `src/arte`. Cada objeto tem uma função própria de
  desenho, que pode ser trocada por uma imagem.
