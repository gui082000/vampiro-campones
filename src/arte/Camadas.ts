// Ordem de desenho: quem tem o número maior aparece por cima.
export const CAMADA = {
  mapa: 0,
  chao: 1, // canteiros
  objetos: 2, // barraca, caixa de venda
  personagens: 3,
  rotulos: 4, // placas com nome, sempre legíveis
  noite: 10, // escurecimento
  hud: 11,
} as const;
