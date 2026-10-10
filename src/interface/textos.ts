import { HORA_AMANHECER, HORA_ANOITECER } from '../config';
import { NOME_ESTACAO } from '../dados/estacoes';
import { definicaoDoItem, type IdItem } from '../dados/itens';
import { PLANTAS, plantaDaSemente, type IdPlanta } from '../dados/plantas';
import { listar, numero, quantidade } from '../util/texto';

const HORAS_DE_SOL = HORA_ANOITECER - HORA_AMANHECER;
const HORAS_DE_NOITE = 24 - HORAS_DE_SOL;

// Ex.: "Primavera e Verão · pronta com 1,5 dia regada · dá 3 trigo"
export function textoDaPlanta(id: IdPlanta): string {
  const p = PLANTAS[id];
  const estacoes = p.estacoes.length === 4 ? 'Todas as estações' : listar(p.estacoes.map((e) => NOME_ESTACAO[e]));
  const tempo =
    p.cresce === 'dia'
      ? `${quantidade(Math.ceil(p.horas / HORAS_DE_SOL), 'dia', 'dias')} de sol (só cresce de dia)`
      : p.cresce === 'noite'
        ? `${quantidade(Math.ceil(p.horas / HORAS_DE_NOITE), 'noite', 'noites')} (só cresce no escuro)`
        : `${numero(p.horas / 24)} ${p.horas <= 24 ? 'dia' : 'dias'}`;
  return `${estacoes} · pronta em ${tempo}, regada · dá ${p.quantidade} ${definicaoDoItem(p.colheita).nome.toLowerCase()}`;
}

// Descrição completa de um item, para o inventário e as lojas
export function textoDoItem(id: IdItem): string {
  const item = definicaoDoItem(id);
  const partes = [item.descricao];
  const planta = plantaDaSemente(id);
  if (planta) partes.push(textoDaPlanta(planta));
  if (item.energia) partes.push(`Comer (F): +${item.energia} de energia`);
  if (item.precoVenda) partes.push(`Vende por ${quantidade(item.precoVenda, 'moeda', 'moedas')}`);
  return partes.join('\n');
}
