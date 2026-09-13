import { describe, expect, it } from 'vitest';

import {
  chainGraph,
  generatorId,
  makeEdge,
  makeGeneratorNode,
  makePromptNode,
  makeResultNode,
  nodeId,
  promptId,
  resultId,
} from '@test/factories/graph';

import { canConnect, completeChain, indexGraph } from '../graph-rules';

const secondPrompt = nodeId(11);
const secondGenerator = nodeId(12);
const secondResult = nodeId(13);

const loose = () =>
  indexGraph(
    [
      makePromptNode(),
      makeGeneratorNode(),
      makeResultNode(),
      makeGeneratorNode(secondGenerator),
      makePromptNode('Море', secondPrompt),
    ],
    [],
  );

describe('canConnect', () => {
  it('разрешает текст → генератор и генератор → результат', () => {
    const indexes = loose();

    expect(canConnect({ source: promptId, target: generatorId }, indexes)).toBe(true);
    expect(canConnect({ source: generatorId, target: resultId }, indexes)).toBe(true);
  });

  it('запрещает связи других типов и связи с неизвестными нодами', () => {
    const indexes = loose();

    expect(canConnect({ source: promptId, target: resultId }, indexes)).toBe(false);
    expect(canConnect({ source: generatorId, target: secondGenerator }, indexes)).toBe(false);
    expect(canConnect({ source: resultId, target: generatorId }, indexes)).toBe(false);
    expect(canConnect({ source: promptId, target: 'нет' }, indexes)).toBe(false);
  });

  it('у входа одна связь: второй текст к занятому генератору не подключается', () => {
    const graph = chainGraph();
    const indexes = indexGraph([...graph.nodes, makePromptNode('Море', secondPrompt)], graph.edges);

    expect(canConnect({ source: secondPrompt, target: generatorId }, indexes)).toBe(false);
  });

  it('у генератора один результат, а текст может питать несколько генераторов', () => {
    const graph = chainGraph();
    const indexes = indexGraph(
      [...graph.nodes, makeGeneratorNode(secondGenerator), makeResultNode(secondResult)],
      graph.edges,
    );

    expect(canConnect({ source: generatorId, target: secondResult }, indexes)).toBe(false);
    expect(canConnect({ source: promptId, target: secondGenerator }, indexes)).toBe(true);
  });
});

describe('completeChain', () => {
  it('для собранной цепочки отдаёт текст и ноду результата', () => {
    const graph = chainGraph();

    expect(completeChain(generatorId, indexGraph(graph.nodes, graph.edges))).toEqual({
      promptText: 'Горы на рассвете',
      resultNodeId: resultId,
    });
  });

  it('пустой текст, отсутствие входа или выхода делают цепочку неполной', () => {
    const graph = chainGraph();
    const blank = indexGraph(
      [makePromptNode('   '), makeGeneratorNode(), makeResultNode()],
      graph.edges,
    );
    const noInput = indexGraph(graph.nodes, [makeEdge(generatorId, resultId)]);
    const noOutput = indexGraph(graph.nodes, [makeEdge(promptId, generatorId)]);

    expect(completeChain(generatorId, blank)).toBeNull();
    expect(completeChain(generatorId, noInput)).toBeNull();
    expect(completeChain(generatorId, noOutput)).toBeNull();
    expect(completeChain(promptId, indexGraph(graph.nodes, graph.edges))).toBeNull();
  });
});
