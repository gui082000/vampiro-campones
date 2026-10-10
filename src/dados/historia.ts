import type { IdAldeao } from './aldeoes';
import type { IdItem } from './itens';

// Atos: em que dia cada um começa
export const ATOS = [
  { numero: 1, nome: 'Chegada', diaInicial: 1 },
  { numero: 2, nome: 'Suspeita', diaInicial: 8 },
  { numero: 3, nome: 'Verdade e escolha', diaInicial: 26 },
];

// Uma cena curta (no máximo 5 caixas). Quem fala: 'narrador' ou um aldeão.
export interface Evento {
  dia: number;
  hora: number; // acontece a partir dessa hora do dia
  quem: 'narrador' | IdAldeao;
  falas: string[];
  pista?: string;
  item?: IdItem;
  suspeita?: number;
  desaparece?: IdAldeao; // levado como "tributo" (não foi o Tomás)
  so?: 'helenaConfia'; // só acontece se a condição valer
}

export const EVENTOS: Record<string, Evento> = {
  chegada: {
    dia: 1, hora: 7, quem: 'narrador',
    falas: [
      'Vale Cinzento. A fazenda que o tio Joaquim deixou estava coberta de mato, e ninguém na vila quis falar dele.',
      'Na primeira noite, algo se mexeu no porão. Tomás desceu com uma vela. Lembra de olhos, de frio... e de uma dor no pescoço.',
      'Acordou ao meio-dia, com o sol queimando a pele e uma fome que pão nenhum mata.',
      'Ele precisa continuar vivendo como camponês. E precisa descobrir o que o tio escondia.',
    ],
  },
  cartaDoTio: {
    dia: 3, hora: 8, quem: 'narrador',
    falas: [
      'Debaixo da porta, um envelope amarelado, com a letra do tio Joaquim.',
      '"Se você está lendo isto, eu falhei. Não confie na colina. Os diários estão no porão. Reforme-o e leia."',
    ],
    pista: 'Carta do tio: os diários estão no porão; não confiar na colina.',
  },
  sinoDaMeiaNoite: {
    dia: 7, hora: 23.5, quem: 'narrador',
    falas: [
      'O sino da igreja toca à meia-noite, sem ninguém na torre.',
      'Na vila, todas as janelas se fecham ao mesmo tempo. Como se todos soubessem o que o sino quer dizer.',
    ],
    pista: 'O sino tocou sozinho à meia-noite do sétimo dia. A vila inteira fechou as janelas.',
  },
  tributo: {
    dia: 9, hora: 7, quem: 'rosalia',
    falas: [
      'Ficou sabendo? A Dona Lurdes sumiu esta noite. Igualzinho ao marido dela, doze anos atrás.',
      'Dizem que foi o lobo. Sempre dizem que foi o lobo.',
      'Mas o sino tocou antes. O sino sempre toca antes.',
    ],
    desaparece: 'viuva',
    suspeita: 10,
    pista: 'A Dona Lurdes desapareceu depois do sino. Ninguém procura quem some.',
  },
  orlandoInvestiga: {
    dia: 12, hora: 9, quem: 'orlando',
    falas: [
      'Estou falando com todo mundo. Quem estava acordado na noite em que a viúva sumiu.',
      'Você vive à noite, Tomás. Eu sei. Eu vejo a luz da sua casa apagada de dia e acesa às três da manhã.',
      'Não é uma acusação. Ainda.',
    ],
    suspeita: 5,
  },
  vilaDividida: {
    dia: 18, hora: 10, quem: 'narrador',
    falas: [
      'Na praça, o padre Anselmo pede calma e orações. Dona Rosália grita que a igreja sabe mais do que diz.',
      'Metade da vila quer subir a colina com tochas. A outra metade tem medo de que isso seja pior.',
    ],
    pista: 'A vila se dividiu: uns querem subir a colina, outros temem a vingança.',
  },
  helenaRevela: {
    dia: 20, hora: 9, quem: 'helena', so: 'helenaConfia',
    falas: [
      'Tomás, eu li os registros da igreja. Os fundadores, os Valadares, fizeram um acordo com algo na colina.',
      'Proteção e boas colheitas. Em troca, de tempos em tempos, uma vida. Os "desaparecidos na floresta".',
      'Seu tio era quem levava as pessoas até lá. O guardião. E agora... acho que querem você no lugar dele.',
      'Estou tentando fazer um remédio com o lírio-da-lua. Se der certo, talvez quebre o que te prende.',
    ],
    pista: 'Helena: o pacto dos fundadores com a colina; o tio era o guardião; querem Tomás no lugar.',
  },
  convite: {
    dia: 25, hora: 20, quem: 'narrador',
    falas: [
      'Na porta da casa, alguém deixou um bilhete escrito com algo escuro e seco.',
      '"O guardião morreu. O sangue dele está em você. Suba à colina. O portão está aberto." — sem assinatura.',
    ],
    pista: 'Um bilhete de sangue: o portão da colina está aberto. O Senhor da Colina chama.',
  },
  elixir: {
    dia: 26, hora: 9, quem: 'helena', so: 'helenaConfia',
    falas: [
      'Consegui. Elixir da aurora. Não sei se cura. Sei que vai doer.',
      'Beba diante dele, na colina, e recuse o pacto. Mas só funciona em quem não tirou nenhuma vida, Tomás.',
    ],
    item: 'elixirDaAurora',
  },
};

// Páginas dos diários do tio (lidas na estante do porão). Cada uma libera num dia.
export const PAGINAS_DO_DIARIO: { dia: number; texto: string }[] = [
  { dia: 1, texto: 'Primeira página: "Fui mordido no inverno de 1871. Desde então, a fome. O padre de então me ensinou a esconder."' },
  { dia: 5, texto: '"Bebo dos animais. Nunca é suficiente. Mas aprendi que dá para viver assim, mais fraco, mais devagar."' },
  { dia: 10, texto: '"Os Valadares me procuraram. Sabiam o que eu era. Disseram que a vila precisava de mim."' },
  { dia: 15, texto: '"O Senhor da Colina não é como eu. É mais velho que a vila. Os fundadores lhe deram a vila em troca de vidas."' },
  { dia: 20, texto: '"Eu escolhia quem subia. Os viajantes primeiro. Depois, quando não havia viajantes... Deus me perdoe."' },
  { dia: 24, texto: '"Vou me recusar. Se eu morrer, ele vai procurar outro do meu sangue. Tomás, perdão."' },
];

// Os finais. A condição de cada um é verificada no jogo (sistemas/Historia).
export const FINAIS = {
  redencao: {
    titulo: 'Redenção',
    texto: 'O elixir queimou como sol por dentro. O Senhor da Colina gritou com a voz de todas as vítimas. Quando a manhã chegou, Tomás sentiu o calor no rosto e não doeu. O pacto estava quebrado. Ele voltou a ser só um camponês, e Vale Cinzento, pela primeira vez em cem anos, dormiu sem medo.',
  },
  guardiao: {
    titulo: 'Guardião',
    texto: 'Tomás se ajoelhou. A colina aceitou o novo guardião, e a vila continuou próspera e protegida. Ninguém nunca soube o preço. De dia ele planta; de noite, escolhe. E vive sozinho com o segredo, como o tio viveu.',
  },
  senhorDaVila: {
    titulo: 'Senhor da Vila',
    texto: 'Tomás bebeu do próprio Senhor da Colina até não sobrar nada. A fome dele agora é antiga. Vale Cinzento acorda todos os dias sabendo a quem pertence, e ninguém mais sobe a colina: é a colina que desce até eles.',
  },
  terraLimpa: {
    titulo: 'A terra limpa',
    texto: 'Tomás nunca bebeu de gente. Fraco, faminto, ele disse não. Sem um guardião, o Senhor da Colina definhou junto com a fome dele, e as ruínas viraram só pedras. Tomás ainda não suporta o sol, mas a terra, finalmente, é só terra.',
  },
  fuga: {
    titulo: 'Fuga',
    texto: 'Tomás subiu na carroça do viajante e não olhou para trás. A fazenda virou mato de novo. Em outras vilas, em outras estradas, as pessoas começaram a sumir. A fome foi com ele.',
  },
  linchado: {
    titulo: 'Linchado',
    texto: 'Tochas na porta da fazenda. Orlando à frente, o padre atrás com a cruz. A vila decidiu que o mal de Vale Cinzento tinha nome: Tomás.',
  },
  fome: {
    titulo: 'A fome venceu',
    texto: 'Dois dias inteiros sem se alimentar. O que restava do camponês Tomás se apagou, e só a fome saiu da casa naquela noite.',
  },
} as const;

export type IdFinal = keyof typeof FINAIS;

// Para o final Senhor da Vila: essência mínima e aldeões mortos
export const PODER_PARA_DOMINAR = { essencia: 12, mortes: 2 };
