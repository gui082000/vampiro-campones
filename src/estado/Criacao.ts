import {
  CAPACIDADE_DO_ABRIGO,
  CAPACIDADE_DO_COMEDOURO,
  ESPECIES,
  ESPECIE_DO_ABRIGO,
  type Abrigo,
  type Especie,
} from '../dados/animais';
import type { Estacao } from '../dados/estacoes';
import { definicaoDoItem, nomeDoItem, type IdItem } from '../dados/itens';
import type { Inventario } from './Inventario';
import { feito, nada, type Resultado } from './Resultado';

export interface Animal {
  especie: Especie;
  nome: string;
  produtoPronto: boolean; // comeu ontem e tem ovo/leite para recolher
  fraco?: boolean; // o vampiro bebeu dele: não produz no dia seguinte
}

export interface DadosDoAbrigo {
  comedouro: number; // porções de comida guardadas
  animais: Animal[];
}

// Os animais da fazenda, por abrigo. Só dados simples, para poder salvar.
export class Criacao {
  abrigos: Record<Abrigo, DadosDoAbrigo> = {
    galinheiro: { comedouro: 0, animais: [] },
    celeiro: { comedouro: 0, animais: [] },
  };
}

export function comprarAnimal(
  criacao: Criacao,
  abrigo: Abrigo,
  inventario: Inventario,
  aleatorio: () => number,
): Resultado {
  const especie = ESPECIE_DO_ABRIGO[abrigo];
  const { nome, preco, nomes } = ESPECIES[especie];
  const dados = criacao.abrigos[abrigo];
  if (dados.animais.length >= CAPACIDADE_DO_ABRIGO[abrigo]) return nada(`Não cabe mais nenhuma ${nome.toLowerCase()}`);
  if (inventario.moedas < preco) return nada(`${nome} custa ${preco} moedas`);

  const usados = new Set(dados.animais.map((a) => a.nome));
  const livres = nomes.filter((n) => !usados.has(n));
  const nomeDoAnimal = livres[Math.floor(aleatorio() * livres.length)] ?? `${nome} ${dados.animais.length + 1}`;

  inventario.moedas -= preco;
  dados.animais.push({ especie, nome: nomeDoAnimal, produtoPronto: false });
  return feito(`Chegou ${nomeDoAnimal}, sua nova ${nome.toLowerCase()}!`);
}

// Coloca no comedouro a comida de animal que estiver no inventário, até encher
export function encherComedouro(dados: DadosDoAbrigo, inventario: Inventario): Resultado {
  const espaco = CAPACIDADE_DO_COMEDOURO - dados.comedouro;
  if (espaco <= 0) return nada('O comedouro já está cheio');

  let colocados = 0;
  const racoes = inventario.slots
    .filter((s) => s !== null && definicaoDoItem(s.item).racao)
    .map((s) => s!.item);
  for (const item of new Set<IdItem>(racoes)) {
    const qtd = Math.min(espaco - colocados, inventario.quantidade(item));
    if (qtd <= 0) continue;
    inventario.remover(item, qtd);
    colocados += qtd;
  }
  if (colocados === 0) return nada('Você não tem comida de animal (trigo ou feno)');
  dados.comedouro += colocados;
  return feito(`Comedouro: +${colocados} (${dados.comedouro}/${CAPACIDADE_DO_COMEDOURO})`);
}

// Novo dia: cada animal come (no pasto, se houver e não for inverno; senão, do
// comedouro) e, se comeu, deixa um produto para recolher
export function passarDiaDaCriacao(criacao: Criacao, temPasto: boolean, estacao: Estacao) {
  const pastando = temPasto && estacao !== 'inverno';
  for (const dados of Object.values(criacao.abrigos)) {
    for (const animal of dados.animais) {
      let comeu = pastando;
      if (!comeu && dados.comedouro > 0) {
        dados.comedouro -= 1;
        comeu = true;
      }
      if (comeu && !animal.fraco) animal.produtoPronto = true;
      animal.fraco = false;
    }
  }
}

// Recolhe o produto de um animal (E no animal)
export function recolherDoAnimal(animal: Animal, inventario: Inventario): Resultado {
  if (!animal.produtoPronto) return nada(`${animal.nome} ainda não tem nada para dar`);
  const produto = ESPECIES[animal.especie].produto;
  if (inventario.espacoPara(produto) < 1) return nada('Inventário cheio');
  inventario.adicionar(produto, 1);
  animal.produtoPronto = false;
  return feito(`+1 ${nomeDoItem(produto)}`);
}

// Recolhe os produtos de todos os animais do abrigo
export function recolherDoAbrigo(dados: DadosDoAbrigo, inventario: Inventario): Resultado {
  let recolhidos = 0;
  let produto: IdItem | null = null;
  for (const animal of dados.animais) {
    if (!animal.produtoPronto) continue;
    produto = ESPECIES[animal.especie].produto;
    if (inventario.espacoPara(produto) < 1) break;
    inventario.adicionar(produto, 1);
    animal.produtoPronto = false;
    recolhidos++;
  }
  if (!produto) return nada('Nada para recolher');
  if (recolhidos === 0) return nada('Inventário cheio');
  return feito(`+${recolhidos} ${nomeDoItem(produto)}`);
}
