// Todos os itens do jogo. A chave (ex.: sementeTrigo) é o id usado no código e nos
// saves: depois que existirem saves, não mude as chaves. Nome e descrição aparecem
// para o jogador. Preços e energia de cada item ficam aqui, junto dele.
// A cor e a sigla são a arte provisória do ícone (um quadrado colorido com letras).

export type TipoDeItem =
  | 'ferramenta'
  | 'semente'
  | 'colheita'
  | 'coleta'
  | 'peixe'
  | 'material'
  | 'animal'
  | 'comida'
  | 'vampiro';

export interface DefinicaoDeItem {
  nome: string;
  tipo: TipoDeItem;
  descricao: string;
  cor: number;
  sigla: string;
  precoVenda?: number; // sem preço: não dá para vender
  precoCompra?: number; // preço na barraca (sementes)
  energia?: number; // dá para comer (tecla F): quanta energia recupera
  racao?: boolean; // serve de comida para os animais no comedouro
  pilhaMaxima?: number; // quantos cabem num espaço do inventário (padrão 99)
}

export const ITENS = {
  // Ferramentas
  enxada: { nome: 'Enxada', tipo: 'ferramenta', descricao: 'Ara a terra para plantar.', cor: 0x8d6e4a, sigla: 'En', pilhaMaxima: 1 },
  regador: { nome: 'Regador', tipo: 'ferramenta', descricao: 'Rega a terra arada. Encha no rio ou no poço.', cor: 0x4a7fb5, sigla: 'Rg', pilhaMaxima: 1 },
  machado: { nome: 'Machado', tipo: 'ferramenta', descricao: 'Corta árvores para conseguir madeira.', cor: 0xa0522d, sigla: 'Ma', pilhaMaxima: 1 },
  picareta: { nome: 'Picareta', tipo: 'ferramenta', descricao: 'Quebra pedras.', cor: 0x7d7d8c, sigla: 'Pi', pilhaMaxima: 1 },
  varaDePesca: { nome: 'Vara de pesca', tipo: 'ferramenta', descricao: 'Olhe para a água e aperte E para pescar.', cor: 0xc9a66b, sigla: 'Vp', pilhaMaxima: 1 },

  // Sementes (as regras de cada planta ficam em dados/plantas)
  sementeTrigo: { nome: 'Semente de trigo', tipo: 'semente', descricao: 'Plante em terra arada.', cor: 0xd8c27a, sigla: 'sTr', precoCompra: 4 },
  sementeBatata: { nome: 'Semente de batata', tipo: 'semente', descricao: 'Plante em terra arada.', cor: 0xb08850, sigla: 'sBa', precoCompra: 8 },
  sementeTomate: { nome: 'Semente de tomate', tipo: 'semente', descricao: 'Plante em terra arada.', cor: 0xd0604a, sigla: 'sTo', precoCompra: 10 },
  sementeMilho: { nome: 'Semente de milho', tipo: 'semente', descricao: 'Plante em terra arada.', cor: 0xe8c840, sigla: 'sMi', precoCompra: 12 },
  sementeGirassol: { nome: 'Semente de girassol', tipo: 'semente', descricao: 'Plante em terra arada.', cor: 0xe0a020, sigla: 'sGi', precoCompra: 15 },
  sementeAbobora: { nome: 'Semente de abóbora', tipo: 'semente', descricao: 'Plante em terra arada.', cor: 0xe07a20, sigla: 'sAb', precoCompra: 20 },
  sementeRepolho: { nome: 'Semente de repolho', tipo: 'semente', descricao: 'Plante em terra arada.', cor: 0x8ab060, sigla: 'sRe', precoCompra: 14 },
  sementeLirio: { nome: 'Semente de lírio-da-lua', tipo: 'semente', descricao: 'Sementes estranhas que estavam na casa do tio.', cor: 0x8a7ac8, sigla: 'sLi', precoCompra: 30 },

  // Colheitas
  trigo: { nome: 'Trigo', tipo: 'colheita', descricao: 'Vende pouco, mas cresce rápido. Os animais comem.', cor: 0xe0c060, sigla: 'Tr', precoVenda: 3, racao: true },
  batata: { nome: 'Batata', tipo: 'colheita', descricao: 'Boa para sopa.', cor: 0xb8905a, sigla: 'Ba', precoVenda: 6, energia: 5 },
  tomate: { nome: 'Tomate', tipo: 'colheita', descricao: 'Vermelho e suculento.', cor: 0xd84030, sigla: 'To', precoVenda: 5, energia: 6 },
  milho: { nome: 'Milho', tipo: 'colheita', descricao: 'Espigas douradas.', cor: 0xf0d040, sigla: 'Mi', precoVenda: 9, energia: 6 },
  girassol: { nome: 'Girassol', tipo: 'colheita', descricao: 'Só cresce com a luz do sol.', cor: 0xf0b020, sigla: 'Gi', precoVenda: 35 },
  abobora: { nome: 'Abóbora', tipo: 'colheita', descricao: 'Grande e pesada. Vale bem na venda.', cor: 0xe8801a, sigla: 'Ab', precoVenda: 70 },
  repolho: { nome: 'Repolho', tipo: 'colheita', descricao: 'Aguenta o frio do inverno.', cor: 0x90c070, sigla: 'Re', precoVenda: 40, energia: 8 },
  lirioDaLua: { nome: 'Lírio-da-lua', tipo: 'colheita', descricao: 'Uma flor pálida que só abre no escuro.', cor: 0xc8c0f0, sigla: 'Li', precoVenda: 90 },

  // Coisas que se encontra pelo campo
  amora: { nome: 'Amora', tipo: 'coleta', descricao: 'Fruta silvestre. Dá para comer.', cor: 0x6a2050, sigla: 'Am', precoVenda: 4, energia: 8 },
  ervaMedicinal: { nome: 'Erva medicinal', tipo: 'coleta', descricao: 'Folhas de cheiro forte. Úteis em remédios.', cor: 0x50a060, sigla: 'Er', precoVenda: 6 },
  cogumelo: { nome: 'Cogumelo', tipo: 'coleta', descricao: 'Aparece no outono.', cor: 0xc0a080, sigla: 'Co', precoVenda: 12, energia: 10 },

  // Materiais
  madeira: { nome: 'Madeira', tipo: 'material', descricao: 'Para construir.', cor: 0x8a5a30, sigla: 'Md', precoVenda: 1 },
  pedra: { nome: 'Pedra', tipo: 'material', descricao: 'Para construir.', cor: 0x9a9aa8, sigla: 'Pd', precoVenda: 1 },
  fibra: { nome: 'Fibra', tipo: 'material', descricao: 'Tirada do mato. Vira feno e adubo.', cor: 0xa0b050, sigla: 'Fi', precoVenda: 1 },
  feno: { nome: 'Feno', tipo: 'material', descricao: 'Comida para os animais.', cor: 0xd8c070, sigla: 'Fe', precoVenda: 2, racao: true },
  adubo: { nome: 'Adubo', tipo: 'material', descricao: 'Use na terra arada: a planta cresce mais rápido.', cor: 0x5a4030, sigla: 'Ad', precoVenda: 3 },

  // Peixes
  lambari: { nome: 'Lambari', tipo: 'peixe', descricao: 'Peixinho comum de dia.', cor: 0xb0c8d8, sigla: 'La', precoVenda: 8 },
  tilapia: { nome: 'Tilápia', tipo: 'peixe', descricao: 'Boa para assar.', cor: 0x8098a8, sigla: 'Ti', precoVenda: 15 },
  traira: { nome: 'Traíra', tipo: 'peixe', descricao: 'Peixe de dentes afiados. Só sai à noite.', cor: 0x405060, sigla: 'Ra', precoVenda: 25 },
  bagre: { nome: 'Bagre', tipo: 'peixe', descricao: 'Raro e graúdo.', cor: 0x706050, sigla: 'Bg', precoVenda: 40 },

  // Produtos dos animais
  ovo: { nome: 'Ovo', tipo: 'animal', descricao: 'Das galinhas alimentadas.', cor: 0xf0e8d0, sigla: 'Ov', precoVenda: 8 },
  leite: { nome: 'Leite', tipo: 'animal', descricao: 'Das vacas alimentadas.', cor: 0xf8f8f0, sigla: 'Le', precoVenda: 20, energia: 12 },

  // Comidas feitas na cozinha
  pao: { nome: 'Pão', tipo: 'comida', descricao: 'Simples e que sustenta.', cor: 0xc89050, sigla: 'Pa', precoVenda: 15, energia: 25 },
  sopaDeLegumes: { nome: 'Sopa de legumes', tipo: 'comida', descricao: 'Quente e reconfortante.', cor: 0xc0a040, sigla: 'So', precoVenda: 30, energia: 40 },
  omelete: { nome: 'Omelete', tipo: 'comida', descricao: 'Feita com ovos frescos.', cor: 0xf0d060, sigla: 'Om', precoVenda: 25, energia: 30 },
  tortaDeAbobora: { nome: 'Torta de abóbora', tipo: 'comida', descricao: 'O orgulho de qualquer cozinha.', cor: 0xd07020, sigla: 'TA', precoVenda: 120, energia: 60 },
  peixeAssado: { nome: 'Peixe assado', tipo: 'comida', descricao: 'Tilápia com ervas.', cor: 0xb08060, sigla: 'PA', precoVenda: 40, energia: 35 },

  // Itens do vampiro (as receitas só aparecem na Fase 4)
  unguentoSolar: { nome: 'Unguento contra o sol', tipo: 'vampiro', descricao: 'Alivia a queimação da pele sob o sol.', cor: 0xe8d8a0, sigla: 'Un' },
  ervasDeDisfarce: { nome: 'Ervas de disfarce', tipo: 'vampiro', descricao: 'Disfarçam a palidez e o cheiro de sangue.', cor: 0x70905a, sigla: 'Ed' },
  tonicoRubro: { nome: 'Tônico rubro', tipo: 'vampiro', descricao: 'Engana a fome por algumas horas.', cor: 0x902030, sigla: 'TR' },
} satisfies Record<string, DefinicaoDeItem>;

export type IdItem = keyof typeof ITENS;

export function definicaoDoItem(id: IdItem): DefinicaoDeItem {
  return ITENS[id];
}

export function nomeDoItem(id: IdItem): string {
  return ITENS[id].nome;
}

// O que o Tomás tem ao começar o jogo, na ordem da barra de atalhos (teclas 1, 2, 3...)
export const ITENS_INICIAIS: { item: IdItem; qtd: number }[] = [
  { item: 'enxada', qtd: 1 },
  { item: 'regador', qtd: 1 },
  { item: 'machado', qtd: 1 },
  { item: 'picareta', qtd: 1 },
  { item: 'sementeTrigo', qtd: 10 },
  { item: 'sementeLirio', qtd: 3 },
];
