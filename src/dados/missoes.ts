import type { IdAldeao } from './aldeoes';
import type { IdItem } from './itens';

// Pedidos dos aldeões principais. Cada um aparece quando a amizade chega ao mínimo
// (em corações, de 0 a 10) e a missão anterior do mesmo aldeão foi concluída.
// Para concluir, é só falar com quem pediu tendo os itens no inventário.
export interface DefinicaoDeMissao {
  aldeao: IdAldeao;
  titulo: string;
  pedido: string; // o que o aldeão diz ao pedir
  agradecimento: string; // o que diz ao receber
  coracoes: number; // amizade mínima para aparecer
  itens: Partial<Record<IdItem, number>>;
  moedas: number; // recompensa
  amizade: number; // pontos de amizade ganhos (10 pontos = 1 coração)
  pista?: string; // anotada no diário ao concluir
}

export const MISSOES = {
  bento1: {
    aldeao: 'bento', titulo: 'Sementes de troca', coracoes: 0, itens: { trigo: 5 }, moedas: 40, amizade: 15,
    pedido: 'Minha colheita de trigo deu praga. Me arruma 5 trigos? Eu pago.',
    agradecimento: 'Salvou minha semana, vizinho!',
  },
  bento2: {
    aldeao: 'bento', titulo: 'A cerca caída', coracoes: 3, itens: { madeira: 15 }, moedas: 80, amizade: 20,
    pedido: 'Algo derrubou minha cerca de noite. Coisa grande. Preciso de 15 madeiras.',
    agradecimento: 'Agora sim. Só queria saber o que foi que derrubou...',
  },
  bento3: {
    aldeao: 'bento', titulo: 'A flor do Joaquim', coracoes: 6, itens: { lirioDaLua: 1 }, moedas: 150, amizade: 30,
    pedido: 'Seu tio me deu uma flor branca uma vez, de noite. Disse que era "pra lembrar". Consegue uma?',
    agradecimento: 'É essa. Ele disse: "quando eu não estiver mais aqui, alguém vai ter que guardar a colina". Eu não entendi.',
    pista: 'Bento: o tio dizia que "alguém vai ter que guardar a colina".',
  },
  helena1: {
    aldeao: 'helena', titulo: 'Ervas para o inverno', coracoes: 0, itens: { ervaMedicinal: 3 }, moedas: 45, amizade: 15,
    pedido: 'Meu estoque de ervas medicinais acabou. Três já me ajudam.',
    agradecimento: 'Perfeitas. Você tem jeito para achar o que está escondido.',
  },
  helena2: {
    aldeao: 'helena', titulo: 'Doce para o remédio', coracoes: 3, itens: { amora: 5 }, moedas: 60, amizade: 20,
    pedido: 'Remédio amargo ninguém toma. Cinco amoras deixam o xarope bom.',
    agradecimento: 'Obrigada. Agora deixa eu ver de novo esses seus olhos...',
  },
  helena3: {
    aldeao: 'helena', titulo: 'A flor que acalma o sangue', coracoes: 6, itens: { lirioDaLua: 2 }, moedas: 120, amizade: 30,
    pedido: 'Preciso estudar o lírio-da-lua. Dois, se conseguir. Não pergunte pra quê. Ainda.',
    agradecimento: 'Com isso talvez eu entenda o que aconteceu com o seu tio. E com você.',
    pista: 'Helena estuda o lírio-da-lua: "acalma o sangue". Ela fala em cura.',
  },
  padre1: {
    aldeao: 'padre', titulo: 'Pão para os pobres', coracoes: 0, itens: { trigo: 6 }, moedas: 35, amizade: 15,
    pedido: 'A igreja faz pão para quem não tem. Seis trigos fariam diferença.',
    agradecimento: 'Deus lhe pague, filho.',
  },
  padre2: {
    aldeao: 'padre', titulo: 'Leite para os enfermos', coracoes: 3, itens: { leite: 2 }, moedas: 70, amizade: 20,
    pedido: 'Duas garrafas de leite para os velhos doentes que cuido na paróquia.',
    agradecimento: 'Vão dormir melhor esta noite. Obrigado, filho.',
  },
  padre3: {
    aldeao: 'padre', titulo: 'Velas de vigília', coracoes: 6, itens: { fibra: 10, madeira: 5 }, moedas: 90, amizade: 30,
    pedido: 'Preciso de pavio e lenha para a vigília da colina. Dez fibras e cinco madeiras.',
    agradecimento: 'Toda primeira lua cheia a igreja reza voltada para a colina. Ninguém lembra mais por quê. Eu lembro.',
    pista: 'Padre: a igreja reza voltada para a colina em toda lua cheia.',
  },
  rosalia1: {
    aldeao: 'rosalia', titulo: 'Peixe na brasa', coracoes: 0, itens: { tilapia: 2 }, moedas: 50, amizade: 15,
    pedido: 'O cozinheiro fugiu e a clientela quer peixe. Duas tilápias, querido.',
    agradecimento: 'Que beleza! Vou contar pra vila toda que você pesca bem.',
  },
  rosalia2: {
    aldeao: 'rosalia', titulo: 'Ovos para a festa', coracoes: 3, itens: { ovo: 6 }, moedas: 70, amizade: 20,
    pedido: 'Festa de aniversário do Tonho. Seis ovos e eu te devo uma.',
    agradecimento: 'Fico te devendo. E eu sempre pago... com fofoca boa.',
  },
  rosalia3: {
    aldeao: 'rosalia', titulo: 'O vinho do Solar', coracoes: 6, itens: { girassol: 2 }, moedas: 110, amizade: 30,
    pedido: 'Os Valadares pedem flores de girassol toda estação. Me arruma duas, que eu levo.',
    agradecimento: 'Fui ao Solar entregar. Tinha sangue seco no degrau. Não conta pra ninguém.',
    pista: 'Rosália viu sangue seco no degrau do Solar dos Fundadores.',
  },
  orlando1: {
    aldeao: 'orlando', titulo: 'Pedra de amolar', coracoes: 0, itens: { pedra: 10 }, moedas: 40, amizade: 15,
    pedido: 'Dez pedras. Pra amolar faca e fazer armadilha.',
    agradecimento: '...Bom.',
  },
  orlando2: {
    aldeao: 'orlando', titulo: 'O peixe da noite', coracoes: 3, itens: { traira: 1 }, moedas: 80, amizade: 20,
    pedido: 'Traíra só sai à noite. Quero ver se você tem coragem de pescar no escuro.',
    agradecimento: 'Pescou de noite e voltou inteiro. Interessante.',
  },
  orlando3: {
    aldeao: 'orlando', titulo: 'Madeira para a torre', coracoes: 6, itens: { madeira: 25 }, moedas: 120, amizade: 30,
    pedido: 'Vou levantar uma torre de vigia perto da colina. Vinte e cinco madeiras.',
    agradecimento: 'Da torre dá pra ver quem entra e quem sai da colina. Inclusive você.',
    pista: 'Orlando vai vigiar a colina de uma torre.',
  },
} satisfies Record<string, DefinicaoDeMissao>;

export type IdMissao = keyof typeof MISSOES;
