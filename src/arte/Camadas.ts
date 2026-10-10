// Ordem de desenho: quem tem o número maior aparece por cima.
export const CAMADA = {
  mapa: 0,
  chao: 1, // terra arada, plantas, marcação de terreno
  mundo: 2, // objetos, animais e o Tomás (entre 2 e 3, ordenados pela altura na tela)
  cursor: 4, // contorno amarelo do que está na frente do Tomás
  rotulos: 5, // placas com nome, sempre legíveis
  noite: 10, // escurecimento
  hud: 11,
  janela: 20, // menus e inventário
  transicao: 30, // tela preta ao dormir
} as const;

// Profundidade de algo no mundo pela linha de baixo dele (o "pé"): quem está mais
// abaixo na tela aparece na frente. Assim o Tomás passa atrás de árvores e casas.
export function profundidadeNoMundo(yDoPe: number): number {
  return CAMADA.mundo + yDoPe / 10000;
}
