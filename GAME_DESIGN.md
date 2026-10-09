# Sangue na Terra — Documento de Design

Documento vivo: resume a visão do diretor do jogo e registra as decisões tomadas.
Atualize sempre que uma regra mudar.

## 1. Visão

Jogo 2D top-down de vida no campo + sobrevivência (referências: Stardew Valley, Graveyard Keeper).

- **De dia**, Tomás é um camponês: cultiva, constrói, negocia, conversa com a vila e esconde seu segredo.
- **À noite**, é um vampiro: a fome aperta e ele precisa se alimentar caçando, sem ser descoberto.
- **Tensão central:** tudo o que ele constrói de dia pode ser destruído pelo que faz à noite.
  Caçar demais aumenta a suspeita; caçar de menos enfraquece o corpo e o trabalho.

**Pilares** (na dúvida, decida por eles):

1. As duas metades do dia se alimentam e se prejudicam.
2. Escolhas morais com consequência real, e aldeões que parecem pessoas.
3. Progressão visível nas duas vidas (a fazenda cresce, os poderes crescem).
4. História contada aos poucos, pelo jogo e pelo ambiente, nunca em blocos longos de texto.

## 2. Tecnologia e organização

- **Phaser 4 + TypeScript (modo `strict`) + Vite.** Roda no navegador com `npm run dev`.
- `npm run build` confere os tipos e gera a versão final em `dist/`.
- `npm test` roda os testes automáticos das regras (Vitest), que ficam em `testes/`.
- `node ferramentas/verificar-jogo.mjs ferramentas/roteiros/<fase>.json` testa o jogo de verdade:
  abre no Edge sem janela, segue um roteiro de teclas, mostra o estado e tira fotos
  (precisa do `npm run dev` rodando; as fotos vão para `ferramentas/saida/`).

| Onde | O que tem |
|---|---|
| `src/config.ts` | Números de balanceamento (tempo, preços, velocidades), com comentário |
| `src/dados/` | Conteúdo editável: posições no mapa, ferramentas (depois: falas, itens, plantas, receitas...) |
| `src/estado/` | O que será salvo + regras puras (sem Phaser, por isso dá para testar) |
| `src/sistemas/` | Uma mecânica por arquivo: Relogio, Jogador, Mapa, Fazenda, Loja, Interacao, Ferramentas |
| `src/interface/` | Textos da tela (Hud) e o escurecimento da noite |
| `src/arte/` | Único lugar que carrega imagens e desenha as formas provisórias |
| `src/cenas/` | `CenaPrincipal`: monta e conecta os sistemas |
| `src/util/` | Peças genéricas (eventos, textos) |

- Mecânica nova = arquivo novo em `src/sistemas/`, ligado na `CenaPrincipal`.
- Os sistemas reagem ao tempo escutando o relógio: `relogio.ouvir('novo-dia' | 'amanheceu' | 'anoiteceu', ...)`.
- No modo de desenvolvimento, o jogo fica acessível no console do navegador como `jogo`.

## 3. Regras de trabalho

1. Fases pequenas (seção 10). Ao fim de cada uma: `npm run build` sem erros, testes, resumo curto
   ao diretor, commit no Git e **pausa até o OK** dele.
2. Uma responsabilidade por arquivo; nada de arquivos gigantes.
3. Dados separados do código: falas, aldeões, itens, plantas, receitas, diários e eventos em `src/dados/`.
4. Números de balanceamento em `config.ts`, com comentário.
5. Arte provisória por código em `src/arte/`, fácil de trocar por sprites depois (ver Decisões).
6. Salvar/carregar (localStorage) a partir da Fase 6. Todo estado novo nasce salvável:
   dados simples em `src/estado/`, sem objetos de desenho dentro.
7. Tudo em português do Brasil: textos do jogo, arquivos, classes e variáveis.
8. Teste de verdade: build + testes automáticos das regras (fome, suspeita, crescimento...).
   O que só dá para ver jogando, dizer ao diretor exatamente o que olhar.
9. Não inventar escopo: decisão fora deste documento → a opção mais simples, registrada aqui.
   Perguntar só o que for difícil de desfazer.
10. Conteúdo: tom sombrio, violência sugerida, nada gráfico (sangue estilizado, cenas implícitas).
    **Crianças nunca são alvo nem vítima, em nenhuma circunstância.**

## 4. História (versão inicial, ajustável pelo diretor)

**Título provisório:** *Sangue na Terra*. **Tom:** sombrio e melancólico, com momentos de calor humano.
O jogador deve sentir carinho pela vila e culpa pelo que faz.

**Premissa:** Tomás, um camponês pobre, herda a fazenda abandonada de um tio que quase ninguém em
Vale Cinzento quer mencionar. Na primeira noite é atacado por algo nas sombras do porão e acorda
diferente: a luz do sol o enfraquece e uma fome nova o consome. Para sobreviver, precisa se
alimentar sem ser descoberto; para entender o que aconteceu, precisa descobrir o que o tio escondia.

**Segredo central, revelado em camadas:**

1. O tio também era vampiro; a fazenda tem um porão selado com os diários dele.
2. Há gerações, os fundadores de Vale Cinzento fizeram um pacto com o **Senhor da Colina**: proteção e
   prosperidade em troca de um tributo periódico em vidas, escondido como "desaparecidos na floresta".
   O tio era o **guardião** que recebia e escoltava o tributo.
3. O tio morreu (ou foi morto) sem passar o posto adiante, e o Senhor da Colina escolheu Tomás à força:
   foi a criatura quem o mordeu. A vila precisa de um novo guardião, e parte dela sabe disso.

**Aldeões principais** (cada um com nome, rotina, casa, relação com o jogador e papel na história):

| Aldeão | Quem é | Papel |
|---|---|---|
| Bento | Vizinho fazendeiro e primeiro amigo; ajuda na colheita, conta histórias | O que o jogador não quer machucar: quanto mais amizade, mais pesa caçar perto dele |
| Helena | Curandeira e herbolária; vende ervas e remédios, percebe sintomas estranhos | Sabe do passado da terra; pode virar aliada ou ameaça; ligada à cura |
| Padre Anselmo | Guia da igreja; os sermões aumentam a desconfiança sobre a noite | Autoridade moral que cerca o jogador conforme a suspeita sobe |
| Dona Rosália | Dona da taverna e fofoqueira, sabe de tudo | Espalha ou abafa boatos; fonte de pistas; termômetro da suspeita |
| Orlando | Caçador de lobos, calado e observador | Antagonista humano: investiga e arma armadilhas quando a suspeita passa do limite |
| Viajantes | Mercador, peregrino: chegam e vão embora | A presa de menor risco, porém rara |

Mais 4 a 6 aldeões de fundo (agricultor, ferreiro, lenhador, viúva...), com nome e uma fala característica.
Todos os aldeões adultos têm falas que mudam com a amizade, o dia e os eventos.

**Atos:**

- **Ato 1, dias 1 a 7 (Chegada):** rotina da fazenda, primeira noite, fome, primeira caça, conhecer a vila.
  Mistério plantado: porão selado, diário parcial.
- **Ato 2, dias 8 a 25 (Suspeita):** desaparecimentos notados, Orlando investiga, os diários revelam o tio
  e o pacto, a vila se divide.
- **Ato 3, dia 26 em diante (Verdade e escolha):** confronto com o Senhor da Colina e com a vila; finais.

**Finais** (soma das escolhas, não um botão):

1. **Redenção:** cura com Helena, quebra do pacto, perde os poderes e recomeça.
2. **Guardião:** aceita o posto; mantém a vila segura em troca de segredo e solidão.
3. **Senhor da Vila:** domina a vila e vira o novo mestre, com a vila escravizada.
4. **Fuga:** abandona tudo antes de ser descoberto.
5. **Linchado:** descoberto pela vila (derrota).

**Como a história é contada:** diários e cartas encontráveis, objetos e lápides na fazenda, falas que mudam
com o tempo, eventos fixos em dias-chave e cenas curtas (no máximo 5 caixas de texto por cena).

## 5. Sistemas planejados

**Tempo e clima.** Relógio (feito). Calendário com 4 estações de 14 dias; clima (sol, chuva, neblina,
tempestade); fases da lua (ciclo de 8 dias). Lua cheia: vampiro mais forte e mais faminto. Chuva rega as
plantas sozinha. Neblina ajuda a esconder.

**Fazenda.** No mínimo 6 plantas com estações, tempos e preços próprios (pelo menos 1 que só cresce à noite
e 1 que só cresce de dia). Galinheiro e animais (galinha, vaca) com produtos. Energia do camponês (gasta nas
ferramentas, recupera dormindo ou comendo). Construção: melhorar a casa (cama, cozinha, depósito), cerca,
celeiro, poço e **porão secreto** (esconderijo, cofre, ritual), pagando madeira, pedra e moedas. Coleta:
lenha, pedra, ervas, frutas silvestres, pesca simples. Artesanato: bancada para ferramentas, itens de
construção e itens do vampiro (protetor contra o sol, ervas de disfarce, poções).

**Vampirismo.**
- Fome (sangue): cresce com o tempo, mais rápido à noite e na lua cheia. Fome alta = menos energia, mais
  lento e sintomas visíveis que aumentam a suspeita. Fome máxima por vários dias leva a um final ruim.
- Sol: de dia o vampiro não existe como tal, mas a fome e a maldição geram sinais (palidez, cansaço) que
  precisam ser escondidos. Regras exatas a definir na Fase 4.
- Poderes noturnos desbloqueáveis (árvore simples, comprados com um recurso ganho caçando): velocidade,
  visão noturna, névoa (invisibilidade curta), forma de morcego (atravessa o mapa, curta duração), hipnose.
- Alimentação: **animais** (seguro, pouco nutritivo); **viajantes** (nutritivo e menos suspeito, mas raro,
  às vezes atrai investigação); **aldeões adultos** (muito nutritivo, alta suspeita, peso moral);
  **sem matar** (sugar pouco e apagar a memória com hipnose: preserva a vida, mas é mais difícil e arriscado).
- Caça com furtividade: alvos com rotina e campo de visão, aproximação pelas sombras, sem barulho, pequeno
  desafio na mordida, testemunhas, corpos e evidências que precisam ser escondidos.
- Voltar para casa antes do amanhecer. Pego pelo sol longe do esconderijo = penalidade clara
  (não morte instantânea no começo do jogo).

**Suspeita da vila.** Barra de 0 a 100 com faixas: calma, boatos, desconfiança, investigação, caça aberta.
Sobe com desaparecimentos, testemunhas, evidências, sinais físicos e boatos; desce com o tempo, boas ações,
ajudar a vila, subornar, doar à igreja, culpar o lobo ou outra pessoa. Cada faixa muda a vila: rondas
noturnas, portas trancadas, armadilhas de Orlando, sermões, preços na loja, aldeões que param de falar.
No topo, a vila ataca (final Linchado).

**Aldeões e relacionamentos.** Rotina por hora (casa, trabalho, taverna, igreja, dormir), caminhos, reação ao
clima e à noite. Amizade de 0 a 10 (sobe com conversas, presentes, ajuda e missões; desce com as ações
noturnas). Falas e no mínimo 3 missões por aldeão principal, mudando com a amizade e o ato. Quando um
aldeão morre, os outros reagem (luto, rotina, boatos). Loja de sementes, ferramentas, ervas e materiais.

**Mundo e mapa.** Fazenda, vila de Vale Cinzento (praça, igreja, taverna, loja, casa da curandeira, casas),
floresta (coleta, caça, perigos), cemitério e colina (morada do Senhor da Colina, bloqueada até o Ato 3).
Mapa maior que a tela, câmera seguindo o jogador, colisão e transição entre áreas.

**Interface.** HUD com hora, dia, estação, clima, lua, energia, fome, suspeita, dinheiro e atalhos;
inventário em grade com itens empilháveis; diário (pistas, aldeões, missões, finais descobertos); caixa de
diálogo com retrato; pausa (salvar, carregar, opções, controles); tela inicial; telas de fim para cada final.

**Som.** Chamadas `tocarSom('nome')` funcionando mesmo sem arquivos de áudio; música de dia e de noite.

## 6. Vitória, derrota e equilíbrio

- Cada final com condição verificável no código, tela própria e uma linha no diário ("finais descobertos").
- Derrotas: fome extrema prolongada e linchamento. Sempre oferecer recomeçar ou carregar o último save.
- Jogo completo em cerca de 30 dias do jogo; ajustar o ritmo do relógio para ficar agradável.
- Jogar de forma pacífica (só animais) é possível, porém mais lento e com um final próprio.
- Nunca um beco sem saída; o jogador deve sentir a suspeita subir antes de ser tarde.

## 7. Estado atual (fim da Fase 0)

- Mapa do RPG Map 2 (190×120 células de 32 px) com colisão em paredes, árvores e água; câmera segue o Tomás.
- Tomás com sprite animado (frente, lado, costas), andando com WASD ou setas.
- Relógio: 1 hora do jogo = 5 s. O dia vira às 6h; amanhece às 6h e anoitece às 19h (com eventos).
  A tela escurece à noite e o relógio fica vermelho ("Vampiro").
- Fazenda: 12 canteiros no campo cercado ao lado da casa. Teclas 1 (enxada), 2 (regador), 3 (sementes);
  E para arar, plantar, regar e colher. Regada, a planta fica pronta em 36 horas do jogo e dá 2 trigos.
- Barraca de sementes (1 moeda) e caixa de venda (2 moedas por trigo) no pátio da casa.
- Ainda não existem aldeões (o código antigo, de bolinhas andando à toa, foi removido).

## 8. Decisões tomadas

- **2026-10-09 — Phaser 4.** O projeto já usava a versão 4 (o briefing citava a 3). É a mesma engine.
- **2026-10-09 — Arte.** As imagens que já existem continuam: o mapa do RPG Map 2, o tileset (barraca) e o
  sprite do Tomás. Elementos novos usam formas desenhadas por código. Todo carregamento de arte fica em `src/arte/`.
- **2026-10-09 — O mapa atual é um rascunho.** Casas e cidades são só retângulos com nome. A Fase 2 constrói o
  mundo de verdade seguindo a história, aproveitando o terreno (rio, florestas, caminhos). Proposta:
  - cidade murada → Vale Cinzento (os prédios viram igreja, taverna, loja, casa da Helena, casas);
  - castelo do vampiro → morada do Senhor da Colina (fechada até o Ato 3);
  - castelo do rei → casa da família fundadora, a do pacto;
  - lugar para queimar corpos → onde sumir com evidências;
  - falta criar o cemitério.
- **2026-10-09 —** Barraca de sementes e caixa de venda ficam provisoriamente no pátio da casa, até a vila existir.
- **2026-10-09 —** O dia vira às 6h (a madrugada conta como a noite do dia anterior). Noite = das 19h às 6h.
- **2026-10-09 —** A rega vale até a colheita (não seca com os dias). Rever na Fase 1.
- **2026-10-09 —** Commits ficam no computador; envio para o GitHub só quando o diretor pedir.

## 9. Decisões pendentes

- **Antes da Fase 2:**
  - confirmar a correspondência mapa ↔ história acima;
  - o mapa é uma imagem única, então o Tomás sempre aparece por cima de árvores e telhados. Passar "atrás"
    das coisas exige uma camada separada ou migrar para o Tiled;
  - como o mundo é um mapa aberto, a proposta é ter troca de tela só ao entrar em lugares fechados
    (casa, porão, igreja).
- **Na Fase 4:** duração do dia. Com 2 minutos por dia, a noite dura cerca de 1 minuto, curta para caçar
  com furtividade. É só um número no `config.ts`.

## 10. Fases de desenvolvimento

- [x] **Fase 0 – Preparação:** pastas organizadas, relógio com eventos, fazenda religada no mapa novo,
  testes automáticos e este documento.
- [ ] **Fase 1 – Fazenda completa:** estações, mais plantas, energia, coleta, animais, construção básica,
  artesanato, inventário em grade.
- [ ] **Fase 2 – Mundo e vila:** fazenda, vila, floresta e cemitério; transição entre áreas; construções da vila.
- [ ] **Fase 3 – Aldeões:** rotinas, falas, amizade, missões, loja expandida, diário.
- [ ] **Fase 4 – Vampirismo:** fome, modo noturno, as 4 formas de alimentação, sinais físicos,
  esconderijo/porão, poderes iniciais.
- [ ] **Fase 5 – Caça e suspeita:** furtividade, testemunhas, evidências, suspeita com faixas e reação da vila,
  Orlando e as rondas.
- [ ] **Fase 6 – Salvar/carregar,** menus, tela inicial, pausa, opções.
- [ ] **Fase 7 – História:** Atos 1, 2 e 3 com eventos, diários, cenas curtas e pistas; Senhor da Colina; os 5 finais.
- [ ] **Fase 8 – Clima,** estações, lua, poderes avançados, eventos aleatórios e festivais.
- [ ] **Fase 9 – Polimento:** balanceamento, bugs, desempenho, som, textos, testes do jogo inteiro por simulação,
  README, preparação para publicar.
