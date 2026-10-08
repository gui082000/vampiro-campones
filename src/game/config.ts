// Constantes do jogo, centralizadas para fácil ajuste de balanceamento.

// Tamanho da janela (viewport) que o jogador vê na tela
export const LARGURA = 800;
export const ALTURA = 600;

// O tamanho do mundo vem do mapa (src/assets/MapaGame2d.json), ver Mapa.ts

export const VELOCIDADE_JOGADOR = 160;

// Tempo
export const SEGUNDOS_POR_HORA = 5; // 1 hora do jogo = 5 segundos reais (dia completo = 2 minutos)
export const HORA_INICIAL = 7;
export const ESCURIDAO_MAXIMA = 0.7;
export const HORA_SECAR = 6; // a rega seca todo dia às 6h

// Fazenda
export const TAMANHO_CANTEIRO = 40;
export const HORAS_PARA_CRESCER = 36; // horas do jogo COM a planta regada
export const SEMENTES_INICIAIS = 5;
export const COLHEITA_POR_PLANTA = 2; // quantidade de trigo gerada por colheita
export const PRECO_SEMENTE = 1; // custo de 1 semente na barraca
export const PRECO_VENDA = 2; // valor de 1 trigo na caixa de venda
