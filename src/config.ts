// Constantes do jogo, centralizadas para fácil ajuste de balanceamento.
// Números que pertencem a um item, planta ou construção (preço, tempo de crescer...)
// ficam junto da definição dele, em src/dados.
import type { Estacao } from './dados/estacoes';

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
export const HORA_ACORDAR = 6; // quem dorme acorda na próxima vez que o relógio marcar essa hora
export const ESCURIDAO_MAXIMA = 0.7; // 0 = a noite não escurece a tela, 1 = tela preta na madrugada

// Calendário
export const DIAS_POR_ESTACAO = 14;
export const ESTACAO_INICIAL: Estacao = 'primavera';

// Energia do camponês
export const ENERGIA_MAXIMA = 100;
export const ENERGIA_AO_ACORDAR_NA_PALHA = 0.8; // fração da energia máxima (com a cama de madeira: tudo)
export const CUSTO_DE_ENERGIA = {
  arar: 2,
  regar: 1,
  pescar: 2,
}; // cortar árvore, quebrar pedra e arrancar mato: ver dados/recursos

// Inventário
export const TAMANHO_INVENTARIO = 24; // 3 fileiras de 8; a primeira é a barra de atalhos (teclas 1 a 8)
export const TAMANHO_BARRA = 8;
export const TAMANHO_DEPOSITO = 24;
export const MOEDAS_INICIAIS = 100;
export const CAPACIDADE_REGADOR = 20; // regadas por enchida

// Fazenda
export const MULTIPLICADOR_ADUBO = 1.5; // terra adubada: a planta cresce 50% mais rápido

// Pesca (em segundos reais)
export const PESCA_ESPERA_MINIMA = 1.5; // tempo até o peixe morder
export const PESCA_ESPERA_MAXIMA = 4;
export const PESCA_TEMPO_PARA_FISGAR = 0.8; // depois do "!", quanto tempo para apertar E
