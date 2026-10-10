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
| `src/config.ts` | Números gerais de balanceamento (tempo, energia, inventário, pesca), com comentário |
| `src/dados/` | Conteúdo editável: itens, plantas, recursos, receitas, construções, animais, peixes, estações e posições no mapa (`mundo.ts`). Preço, tempo e energia de cada coisa ficam junto da definição dela |
| `src/estado/` | O que será salvo + regras puras (sem Phaser, por isso dá para testar) |
| `src/sistemas/` | Uma mecânica por arquivo: Relogio, Jogador, Mapa, Interacao, BarraDeAtalhos, Fazenda, Coleta, Pesca, Loja, Artesanato, Construcao, Animais, Casa. `Mundo.ts` é o que todos compartilham |
| `src/interface/` | Tela: Hud, Menu, TelaDoInventario, Avisos, Transicao (tela preta ao dormir), Escurecimento |
| `src/arte/` | Único lugar que carrega imagens e desenha as formas provisórias (objetos, ícones, estações) |
| `src/cenas/` | `CenaPrincipal`: monta e conecta os sistemas |
| `src/util/` | Peças genéricas (eventos, áreas, sorteio com semente, controle do teclado, textos) |

- Mecânica nova = arquivo novo em `src/sistemas/`, ligado na `CenaPrincipal`.
- Os sistemas reagem ao tempo escutando o relógio: `relogio.ouvir('passou' | 'novo-dia' | 'amanheceu' | 'anoiteceu', ...)`.
  O `passou` chega em pedaços que são todos de dia ou todos de noite (até quando o Tomás dorme).
- No modo de desenvolvimento, o jogo fica acessível no console do navegador como `jogo`.

**Controles:** J abre o diário · à noite, E em alguém dormindo (ou num animal) oferece morder · WASD ou setas andam · E usa o que está à frente do Tomás (com o item da mão) · 1 a 8 ou a
rodinha do mouse escolhem o item · F come o item da mão · I abre o inventário · Esc ou Q fecham menus ·
Tab troca de lado no depósito.

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

## 7. Estado atual (fim da Fase 1)

- Mapa do RPG Map 2 (190×120 células de 32 px) com colisão em paredes, árvores e água; câmera segue o Tomás.
  Muda de tom a cada estação.
- Tomás com sprite animado; a tecla E age na célula à frente dele (contorno amarelo).
- Relógio: 1 hora do jogo = 5 s; dia vira às 6h; noite das 19h às 6h. Calendário com 4 estações de 14 dias,
  começando na primavera. O relógio para enquanto há menu ou inventário aberto.
- Inventário de 24 espaços (tecla I), com barra de atalhos de 8 (teclas 1 a 8); itens empilham até 99.
- Energia (100): ferramentas gastam; comer (F) e dormir recuperam.
- Fazenda: todo o campo cercado ao lado da casa pode ser arado. 8 plantas com estações próprias (girassol só
  cresce de dia, lírio-da-lua só à noite). A terra seca todo dia às 6h; adubo acelera; fora da estação a planta morre.
- Coleta: árvores (machado → madeira), pedras (picareta → pedra), mato (→ fibra), arbustos de amora, ervas
  medicinais, cogumelos no outono. Tudo volta depois de alguns dias.
- Pesca no rio com a vara (feita na bancada): esperar a mordida e apertar E no "!". Peixes de dia e de noite.
- Bancada no pátio (vara de pesca, feno, adubo). Barraca vende as sementes da estação; caixa de venda compra
  tudo (o "vender tudo" deixa de fora os materiais de construção).
- Construções no campo: galinheiro, celeiro, poço, cerca do pasto. Na porta da casa: dormir, cozinhar,
  depósito (baú de 24 espaços) e melhorias (cama de madeira, cozinha, depósito).
- Animais: galinhas e vacas, compradas no próprio abrigo; comem do comedouro (trigo ou feno) ou pastam com a
  cerca; dão ovo ou leite por dia.
- Aldeões (Fase 3): ver decisões abaixo. Ainda não há nada do vampiro (Fase 4).

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
- **2026-10-09 —** Commits ficam no computador; envio para o GitHub só quando o diretor pedir.

**Fase 1 (2026-10-10):**
- A planta cresce pelas horas em que está regada; **a terra seca todo dia às 6h** (na Fase 0 a rega valia até a
  colheita). A chuva, na Fase 8, vai regar sozinha.
- O campo cercado inteiro pode ser arado, célula a célula; a tecla E age na célula à frente do Tomás.
- Energia: arar 2, regar 1, pescar 2, cortar árvore e quebrar pedra 3 por golpe, arrancar mato 1. Plantar,
  colher e catar frutas e ervas não gastam. Sem energia, as ferramentas não funcionam.
- Dormir pela porta da casa, a qualquer hora: acorda às 6h. Na palha volta a 80% da energia; com a cama de
  madeira, 100%. As plantas continuam crescendo durante o sono.
- O jogo começa no 1º dia da primavera (`ESTACAO_INICIAL` no config). O ano vira na primavera.
- Planta fora da estação morre na troca de estação e fica no canteiro até ser tirada (E).
- Lírio-da-lua: só cresce à noite. O Tomás começa com 3 sementes "encontradas na casa do tio" e a barraca
  também vende (30 moedas). Rever na história (Fase 7).
- Recursos nascem em lugares sorteados com semente fixa (sempre os mesmos) e voltam depois de alguns dias.
- Animais são comprados no próprio galinheiro/celeiro (até existir a vila). Cada um come 1 porção por dia;
  com a cerca do pasto pastam e não precisam do comedouro, menos no inverno.
- O **porão secreto** ficou para a Fase 4 (lá a fase já prevê "esconderijo/porão").
- Os itens do vampiro (unguento contra o sol, ervas de disfarce, tônico rubro) já existem, mas as receitas
  ficam bloqueadas até a Fase 4.
- Números de cada item, planta, construção e animal ficam junto da definição em `src/dados`; o `config.ts`
  guarda só os números gerais.
- Árvores, pedras, construções e animais são desenhados por código (provisório), e o Tomás passa atrás deles.
  As árvores pintadas na imagem do mapa continuam sempre por baixo dele.

**Fase 3 (2026-10-10):**
- 5 aldeões principais (Bento, Helena, Padre Anselmo, Dona Rosália, Orlando) e 4 de fundo (Dona Cida da
  loja, Tonho ferreiro, Dona Lurdes viúva, Seu Amaro agricultor), em `dados/aldeoes.ts`.
- Rotina por hora: o aldeão **aparece** no próximo lugar da rotina (não atravessa o mapa andando) e passeia
  um pouco onde está. Andar de um lugar a outro pelas ruas fica para a fase de polimento.
- Amizade de 0 a 10 corações (10 pontos cada): conversar dá +3 por dia; presente +10 (gosta), +4 (normal)
  ou -6 (odeia), um por dia. As falas mudam a cada 3 corações. Na Fase 5 as ações noturnas vão tirar amizade.
- Missões: 3 por aldeão principal (`dados/missoes.ts`), liberadas com 0, 3 e 6 corações; levar itens e
  receber moedas e amizade. As últimas dão pistas da história.
- Loja da Dona Cida: sementes da estação + feno, adubo, madeira, pedra, pão e vara de pesca; abre das 8h às 18h.
- Diário (J): missões, amizade, pistas (lápides, livros, conversas) e finais (Fase 7).
- A casa do Bento ficou na cidade; a casa vazia ao norte (porta virada para o rio) não é usada.
- Crianças não aparecem como vítimas: os desaparecidos citados são todos adultos.

**Fase 4 (2026-10-10):**
- Fome de 0 a 100: +0,9/hora de dia e +1,6/hora à noite. Com 70 ou mais o Tomás fica mais lento. Sinais:
  palidez (50), olhos vermelhos (75), presas à mostra (90); os aldeões notam ao conversar.
- Dois dias inteiros terminando com fome 100 = fim de jogo ("A fome venceu"). Por enquanto E recomeça do zero.
- Sol: de 10h às 16h, fora de casa e com fome 50+, cansa 3 de energia por hora (o unguento evita).
  Amanhecer do lado de fora queima: -40 de energia e +20 de fome. Dentro de qualquer prédio está a salvo.
- À noite: 35% mais rápido (mais 25% com o poder Velocidade) e a noite escurece menos para ele.
- Alimentação: animal da fazenda (-15, fica fraco e não produz no dia seguinte), cervo na floresta à noite
  (-25), viajante acampado perto do portão em algumas noites (sempre na 1ª) (-30 um pouco / -60 até o fim),
  aldeão dormindo em casa (-35 um pouco / zera matando). Sem hipnose, quem é mordido lembra (perde 3 corações).
  Matar um aldeão: ele some, as missões dele acabam e todos os outros perdem 1 coração.
- Tudo o que acontece à noite fica registrado (testemunhas, desaparecidos, sinais vistos) para a suspeita da Fase 5.
- Essência vem de cada mordida e compra poderes no altar do porão. Névoa e morcego ficaram para a Fase 8.
- Porão: reformado pela mesa da casa; caixão (dormir até 6h ou até 19h), cofre e altar. Lá estão os
  diários do tio (uma pista).
- A primeira mordida libera na bancada as receitas do vampiro: unguento contra o sol, ervas de disfarce
  (escondem os sinais por um dia) e tônico rubro (-20 de fome), usados com F.

**Fase 5 (2026-10-10):**
- Suspeita de 0 a 100 (números no `config.ts`, em `SUSPEITA`). Sobe com aldeão desaparecido (+25), viajante
  desaparecido (+8), vítima que lembra (+12), ser visto mordendo (+20), sinal notado (+3) e corpo encontrado
  (+15). Desce 3 por dia, com missão concluída (-4), presente (-1), doação de 50 moedas no altar da igreja (-6)
  e a história do lobo contada para a Dona Rosália (-6, uma vez por dia).
- Faixas: Calma (0), Boatos (20), Desconfiança (40: loja 25% mais cara; quem tem menos de 3 corações não fala
  com você; sermão de manhã), Investigação (60: Orlando faz ronda das 21h às 4h), Caça aberta (80: portas da vila
  trancadas à noite e armadilhas nos caminhos, que prendem e tiram 25 de energia). Em 100: final Linchado.
- Furtividade simples: qualquer aldeão acordado a até 6 células, no mesmo lugar (fora ou na mesma sala), vê a
  mordida. O menu da mordida avisa quem pode ver. Sombras e névoa ficam para a Fase 8.
- Quem morre deixa um corpo onde estava. Carregar deixa o Tomás 40% mais lento; queimar na fogueira abaixo das
  ruínas da colina some com ele. O que não for queimado até as 6h é encontrado.

## 9. Decisões pendentes

- Mapa em imagem única: as árvores pintadas no mapa sempre ficam por baixo do Tomás. Resolver na arte final
  (camada da frente separada ou Tiled).

**Fase 2 (2026-10-10):**
- **1 hora do jogo = 12 s** (dia inteiro ≈ 4,8 min; 30 dias ≈ 2,4 horas de jogo), aprovado pelo diretor.
- Correspondência mapa ↔ história aplicada: cidade murada = Vale Cinzento; castelo do rei = Solar dos
  Fundadores (trancado); castelo do vampiro = Ruínas na colina (trancado até o Ato 3); casa da floresta =
  cabana do Orlando; casa vazia ao norte da cidade = casa do Bento; morro da cidade = cemitério.
- Prédios desenhados por código sobre os blocos do mapa (`dados/vila.ts`). Transição só para dentro dos
  prédios (o mundo de fora é contínuo): as salas ficam fora da área do mapa e a porta leva até elas.
- A barraca de sementes saiu do pátio: as sementes se compram no balcão da loja da vila. A caixa de venda
  continua no pátio.
- A casa do Tomás agora tem interior: cama (dormir), mesa (melhorias), fogão, baú e o alçapão do porão,
  trancado (gancho para a Fase 4/7).
- Móveis sem função mostram um texto curto ao serem olhados; lápides e o livro da igreja já contam pedaços
  da história (desaparecidos, o tio, os fundadores).

## 10. Fases de desenvolvimento

- [x] **Fase 0 – Preparação:** pastas organizadas, relógio com eventos, fazenda religada no mapa novo,
  testes automáticos e este documento.
- [x] **Fase 1 – Fazenda completa:** estações, 8 plantas, energia, coleta, pesca, animais, construção básica,
  artesanato, inventário em grade.
- [x] **Fase 2 – Mundo e vila:** Vale Cinzento (igreja, taverna, loja, casas, armazém, solar), cemitério,
  floresta com cabana, colina trancada, interiores dos prédios.
- [x] **Fase 3 – Aldeões:** 9 aldeões com rotina, falas por amizade, presentes, 15 missões, loja da Dona Cida, diário (J).
- [x] **Fase 4 – Vampirismo:** fome, modo noturno, alimentação (animais, cervos, viajantes, aldeões; com e
  sem matar), sinais físicos, sol, porão (caixão, cofre, altar), poderes velocidade/visão noturna/hipnose.
- [x] **Fase 5 – Caça e suspeita:** testemunhas, corpos e fogueira, suspeita com 5 faixas e reação da vila,
  rondas e armadilhas do Orlando, linchamento.
- [ ] **Fase 6 – Salvar/carregar,** menus, tela inicial, pausa, opções.
- [ ] **Fase 7 – História:** Atos 1, 2 e 3 com eventos, diários, cenas curtas e pistas; Senhor da Colina; os 5 finais.
- [ ] **Fase 8 – Clima,** estações, lua, poderes avançados, eventos aleatórios e festivais.
- [ ] **Fase 9 – Polimento:** balanceamento, bugs, desempenho, som, textos, testes do jogo inteiro por simulação,
  README, preparação para publicar.
