// Onde fica a fogueira para sumir com corpos: abaixo das ruínas da colina, onde o mapa
// marca o "lugar para queimar corpos"
export const FOGUEIRA = { coluna: 66, linha: 20 };

// Ronda do Orlando à noite (a partir da faixa "Investigação"): ele anda de ponto em ponto
export const RONDA = [
  { coluna: 126, linha: 78 },
  { coluna: 118, linha: 78 },
  { coluna: 108, linha: 40 },
  { coluna: 107, linha: 16 },
  { coluna: 113, linha: 25 },
  { coluna: 118, linha: 60 },
];
export const RONDA_COMECA = 21;
export const RONDA_TERMINA = 4;

// Armadilhas do Orlando (na faixa "Caça aberta"), armadas toda noite nos caminhos
export const ARMADILHAS = [
  { coluna: 104, linha: 16 },
  { coluna: 101, linha: 17 },
  { coluna: 118, linha: 77 },
  { coluna: 148, linha: 80 },
  { coluna: 110, linha: 30 },
];
export const ARMADILHA_PRENDE_POR = 2000; // ms parado
export const ARMADILHA_ENERGIA = 25;
