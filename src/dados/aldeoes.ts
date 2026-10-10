import type { IdInterior } from './interiores';
import type { IdItem } from './itens';

// Onde um aldeão está: fora (célula do mapa) ou dentro de uma sala (célula sem contar
// as paredes, como os móveis). Se a célula estiver ocupada, ele fica na livre mais perto.
export type Lugar = { sala: 'fora'; coluna: number; linha: number } | { sala: IdInterior; coluna: number; linha: number };

const fora = (coluna: number, linha: number): Lugar => ({ sala: 'fora', coluna, linha });
const em = (sala: IdInterior, coluna: number, linha: number): Lugar => ({ sala, coluna, linha });

export interface DefinicaoDeAldeao {
  nome: string;
  quem: string; // uma linha sobre quem é (aparece no diário)
  principal: boolean; // os principais têm missões e falas por amizade
  cor: number; // tom aplicado ao sprite (arte provisória)
  rotina: [hora: number, lugar: Lugar][]; // a partir da hora, fica no lugar (repete todo dia)
  falas: string[][]; // por faixa de amizade: [0-2 corações, 3-5, 6-8, 9-10]
  gosta: IdItem[];
  odeia: IdItem[];
}

export const ALDEOES = {
  bento: {
    nome: 'Bento',
    quem: 'Vizinho fazendeiro. Foi o primeiro a dar bom-dia.',
    principal: true,
    cor: 0xd8b080,
    rotina: [
      [0, em('casaDoBento', 0, 2)],
      [7, fora(176, 103)],
      [12, fora(126, 78)],
      [15, fora(170, 103)],
      [19, em('taverna', 5, 3)],
      [22, em('casaDoBento', 0, 2)],
    ],
    falas: [
      ['Tomás, né? Sobrinho do Joaquim. Se precisar de ferramenta, é só gritar.', 'Terra boa a sua. Só não deixa ela secar.', 'Dormiu bem? Você tá com uma cara pálida.'],
      ['Seu tio também plantava à noite, sabia? Nunca entendi o porquê.', 'Vem jantar lá em casa um dia desses.', 'Se ouvir o sino tocar de madrugada, fica dentro de casa.'],
      ['Tem coisa que o povo daqui não fala, Tomás. Mas eu falo pra você: cuidado com a colina.', 'Você é o melhor vizinho que eu já tive. E olha que o Joaquim era bom.'],
      ['Seja o que for que você esconde... eu tô do seu lado.', 'Meu irmão sumiu na floresta quando eu era menino. Ninguém procurou. Ninguém.'],
    ],
    gosta: ['tortaDeAbobora', 'milho', 'pao'],
    odeia: ['pedra', 'fibra'],
  },
  helena: {
    nome: 'Helena',
    quem: 'Curandeira e herbolária. Repara em tudo.',
    principal: true,
    cor: 0x90c0a0,
    rotina: [
      [0, em('casaDaHelena', 2, 3)],
      [8, fora(127, 93)],
      [11, em('casaDaHelena', 3, 3)],
      [16, fora(165, 25)],
      [19, em('casaDaHelena', 2, 3)],
    ],
    falas: [
      ['Você não parece bem. Febre? Deixa eu ver seus olhos... estranho.', 'Ervas medicinais crescem perto da floresta. Me traz se achar.', 'A luz do sol te incomoda? Interessante.'],
      ['Seu tio vinha aqui buscar remédio pra dormir. Nunca dormia.', 'Tem doenças que não estão em livro nenhum, Tomás.', 'Coma direito. Você está perdendo a cor.'],
      ['Existe uma flor que só abre no escuro. Os antigos diziam que ela "acalma o sangue".', 'Se um dia precisar de ajuda... ajuda de verdade... me procure.'],
      ['Eu sei o que você é. Não tenho medo. Tenho esperança de que exista cura.', 'Os fundadores fizeram algo terrível. E a vila inteira paga até hoje.'],
    ],
    gosta: ['ervaMedicinal', 'cogumelo', 'lirioDaLua', 'sopaDeLegumes'],
    odeia: ['trigo', 'madeira'],
  },
  padre: {
    nome: 'Padre Anselmo',
    quem: 'Guia da igreja. Sermões sobre os perigos da noite.',
    principal: true,
    cor: 0x404050,
    rotina: [
      [0, em('casaDoPadre', 2, 3)],
      [7, em('igreja', 4, 2)],
      [12, fora(158, 81)],
      [14, em('igreja', 4, 2)],
      [18, fora(144, 103)],
      [20, em('casaDoPadre', 2, 3)],
    ],
    falas: [
      ['Que Deus o guarde, filho. Ainda mais depois do pôr do sol.', 'A missa é todo dia de manhã. Seu tio nunca veio.', 'A noite não é para os vivos, Tomás.'],
      ['Rezo pelos desaparecidos todas as noites. São tantos nomes...', 'Você trabalha bem a terra. Seu tio também. Talvez bem demais.'],
      ['Há coisas que a Igreja guarda para proteger o povo. Não pergunte sobre o livro de registros.', 'Eu batizei metade desta vila. E enterrei a outra metade.'],
      ['Que Deus me perdoe pelo que eu sei e não disse.', 'Se a colina chamar você, filho... não vá sozinho.'],
    ],
    gosta: ['pao', 'leite', 'ovo'],
    odeia: ['lirioDaLua', 'traira'],
  },
  rosalia: {
    nome: 'Dona Rosália',
    quem: 'Dona da taverna. Sabe de tudo o que acontece.',
    principal: true,
    cor: 0xc07060,
    rotina: [
      [0, em('taverna', 1, 0)],
      [9, fora(148, 80)],
      [12, em('taverna', 1, 0)],
    ],
    falas: [
      ['Novo por aqui? Hum. Sobrinho do Joaquim. A vila toda já sabe.', 'Cerveja? Fofoca? Tenho os dois, e o segundo é de graça.', 'Dizem que você não aparece na missa. Eu não julgo. Muito.'],
      ['O Orlando anda perguntando de você. Por quê, hein?', 'A Helena acha que você está doente. A vila acha outras coisas.'],
      ['Quer saber um segredo? O Solar nunca foi abandonado. Tem luz lá dentro às vezes.', 'Toda vez que alguém some, o povo diz "foi o lobo". Nunca acharam lobo nenhum.'],
      ['Se alguém falar mal de você, eu abafo. Mas me conta a verdade um dia.', 'Os Valadares mandam nesta vila desde que ela existe. E eles não envelhecem direito.'],
    ],
    gosta: ['tomate', 'leite', 'peixeAssado', 'omelete'],
    odeia: ['fibra', 'ervaMedicinal'],
  },
  orlando: {
    nome: 'Orlando',
    quem: 'Caçador de lobos. Calado e observador.',
    principal: true,
    cor: 0x705040,
    rotina: [
      [0, em('cabanaDoOrlando', 4, 3)],
      [6, fora(175, 27)],
      [12, fora(126, 78)],
      [15, fora(165, 25)],
      [20, em('taverna', 8, 6)],
      [23, em('cabanaDoOrlando', 4, 3)],
    ],
    falas: [
      ['...', 'Não ande pela floresta à noite. Tem coisa lá que não é lobo.', 'Você tem cheiro de terra revirada.'],
      ['Seu tio sabia caçar. Só não sei o quê.', 'Pegada estranha perto do rio. Funda demais pra um homem.'],
      ['Eu marco no mapa onde as pessoas somem. Tem um padrão. Sempre perto da colina.', 'Você é o único que não tem medo de mim. Isso me preocupa.'],
      ['Se um dia eu tiver que te caçar, Tomás... espero que não.', 'Os Valadares pagam a minha prata. Não sei mais se é pra matar lobo.'],
    ],
    gosta: ['bagre', 'traira', 'pedra'],
    odeia: ['pao', 'amora'],
  },
  cida: {
    nome: 'Dona Cida',
    quem: 'Cuida da loja da vila.',
    principal: false,
    cor: 0xb0a0c0,
    rotina: [
      [0, em('loja', 3, 0)],
    ],
    falas: [['Sementes fresquinhas! Abro das 8h às 18h.', 'Fiado só pra quem tem cara de pagador.']],
    gosta: ['ovo'],
    odeia: [],
  },
  tonho: {
    nome: 'Tonho',
    quem: 'Ferreiro.',
    principal: false,
    cor: 0x605850,
    rotina: [
      [0, em('casaDoFerreiro', 1, 3)],
      [8, fora(168, 91)],
      [18, em('taverna', 9, 2)],
      [21, em('casaDoFerreiro', 1, 3)],
    ],
    falas: [['Ferro bom não enferruja. Gente boa também não.', 'O Orlando encomendou pontas de prata. Prata, pra lobo?']],
    gosta: ['pedra'],
    odeia: [],
  },
  viuva: {
    nome: 'Dona Lurdes',
    quem: 'Viúva. O marido sumiu na floresta.',
    principal: false,
    cor: 0x404048,
    rotina: [
      [0, em('casaDaViuva', 4, 3)],
      [9, fora(144, 103)],
      [12, em('casaDaViuva', 4, 3)],
    ],
    falas: [['Ele saiu pra buscar lenha. Isso faz doze anos.', 'Não acredite no que dizem do lobo.']],
    gosta: ['amora'],
    odeia: [],
  },
  amaro: {
    nome: 'Seu Amaro',
    quem: 'Agricultor da vila.',
    principal: false,
    cor: 0xa08050,
    rotina: [
      [0, em('casaDoAgricultor', 1, 3)],
      [6, fora(160, 110)],
      [17, em('casaDoAgricultor', 1, 3)],
    ],
    falas: [['Choveu pouco esse ano. Ou choveu sangue, como diz a minha avó.', 'Planta à noite? Só o Joaquim fazia isso.']],
    gosta: ['trigo'],
    odeia: [],
  },
} satisfies Record<string, DefinicaoDeAldeao>;

export type IdAldeao = keyof typeof ALDEOES;

export function definicaoDoAldeao(id: IdAldeao): DefinicaoDeAldeao {
  return ALDEOES[id];
}
