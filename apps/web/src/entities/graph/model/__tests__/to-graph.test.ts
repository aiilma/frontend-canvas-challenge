import { describe, expect, it } from 'vitest';

import {
  chainGraph,
  generatorId,
  makeEdge,
  makeGeneratorNode,
  makePromptNode,
  makeResultNode,
  promptId,
  resultId,
} from '@test/factories/graph';

import { type GraphSnapshot } from '@/entities/graph';

import { serializeGraph, toGraph } from '../to-graph';

describe('toGraph', () => {
  it('оставляет у нод и рёбер только поля контракта', () => {
    const decorated: GraphSnapshot = {
      nodes: [
        {
          ...makePromptNode(),
          selected: true,
          dragging: true,
          measured: { width: 240, height: 90 },
        },
        { ...makeGeneratorNode(), width: 240 },
        makeResultNode(),
      ],
      edges: [
        { ...makeEdge(promptId, generatorId), sourceHandle: 'out', animated: true },
        makeEdge(generatorId, resultId),
      ],
      viewport: { x: 0, y: 0, zoom: 1 },
    };

    expect(toGraph(decorated)).toEqual(chainGraph());
  });

  it('служебные поля не влияют на строку сохранения', () => {
    const plain = chainGraph();
    const decorated = chainGraph();
    decorated.nodes = decorated.nodes.map((node) => ({ ...node, selected: true }));

    expect(serializeGraph(decorated)).toBe(serializeGraph(plain));
  });
});
