// Constantes do jogo, centralizadas para fácil ajuste de balanceamento.

// Tamanho da janela (viewport) que o jogador vê na tela
export const LARGURA = 800;
export const ALTURA = 600;

// O tamanho do mundo vem do mapa (src/assets/MapaGame2d.json), ver sistemas/Mapa.ts

export const VELOCIDADE_JOGADOR = 160; // pixels por segundo

// Tempo
export const SEGUNDOS_POR_HORA = 5; // 1 hora do jogo = 5 segundos reais (dia completo = 2 minutos)
export const HORA_INICIAL = 7; // o jogo começa às 7h do dia 1
export const HORA_NOVO_DIA = 6; // o contador de dias vira às 6h (a madrugada ainda conta como o dia anterior)
export const HORA_AMANHECER = 6; // a partir daqui é dia: Tomás volta a ser só um camponês
export const HORA_ANOITECER = 19; // a partir daqui é noite: hora do vampiro
export const ESCURIDAO_MAXIMA = 0.7; // 0 = a noite não escurece a tela, 1 = tela preta na madrugada

// Fazenda
export const HORAS_PARA_CRESCER = 36; // horas do jogo COM a planta regada
export const SEMENTES_INICIAIS = 5;
export const MOEDAS_INICIAIS = 0;
export const COLHEITA_POR_PLANTA = 2; // quantidade de trigo gerada por colheita
export const PRECO_SEMENTE = 1; // custo de 1 semente na barraca
export const PRECO_VENDA = 2; // valor de 1 trigo na caixa de venda
