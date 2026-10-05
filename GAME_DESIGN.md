# Jogo do Camponês Vampiro — Documento de Design

## Conceito
Jogo 2D de vida e construção (referências: Stardew Valley, Graveyard Keeper).
De dia, o protagonista é um camponês que cuida da terra e da vila.
À noite, é um vampiro que precisa caçar para sobreviver.
A tensão central: o que ele constrói de dia pode ser destruído pelo que faz à noite.

## Tecnologia
Phaser + TypeScript + Vite. Arte provisória (formas simples) até o jogo ser divertido.

## Loop central
**Dia (camponês):** cultivar, coletar, construir, conversar, esconder os sinais do vampirismo.
**Noite (vampiro):** a fome aperta, escolher a vítima, caçar com furtividade, voltar antes do amanhecer.

## Mecânicas planejadas
- Ciclo dia/noite com relógio (FEITO: 1 hora do jogo = 5 s reais)
- Barra de fome (cresce com o tempo, aperta à noite)
- Barra de suspeita da vila (sobe com desaparecimentos e sinais)
- Aldeões com nome, rotina e relação com o jogador
- Alimentação: animais (pouco), viajantes (menos risco, raros), aldeões (muito, arriscado), sem matar (arriscado, preserva a vila)
- Poderes noturnos que evoluem: névoa, velocidade, morcego, hipnose
- Casa como esconderijo: porão, quarto sem janelas, cofre
- Fases da lua e clima afetando fome, poderes e risco
- Caçador de vampiros / padre investigando conforme a suspeita sobe

## História (a definir)
Opções em aberto: (1) mordido sem lembrar por quê, (2) maldição na terra herdada, (3) vila cheia de segredos.
Finais possíveis: redenção (cura), dominação, fuga, descoberto e linchado.

## Roteiro de desenvolvimento
1. [x] Projeto criado e rodando
2. [x] Personagem andando
3. [x] Ciclo dia/noite
4. [x] Fazenda: plantar, crescer, colher
5. [ ] Aldeões com rotina e falas
6. [ ] Barra de fome e modo vampiro
7. [ ] Caça com stealth e barra de suspeita
8. [ ] História e escolhas

## Decisões tomadas
- Trabalhamos em passos pequenos e testáveis.
- Arte final só depois da vertical slice funcionar.
