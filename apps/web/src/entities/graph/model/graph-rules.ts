import { type Connection } from '@xyflow/react';

import { type GraphEdge, type GraphNode } from './graph.types';

export interface GraphIndexes {
  nodeById: Map<string, GraphNode>;
  sourceOfInput: Map<string, string>;
  targetOfGenerator: Map<string, string>;
}

interface Chain {
  promptText: string;
  resultNodeId: string;
}

export const indexGraph = (
  nodes: readonly GraphNode[],
  edges: readonly GraphEdge[],
): GraphIndexes => {
  const nodeById = new Map<string, GraphNode>();
  for (const node of nodes) nodeById.set(node.id, node);
  const sourceOfInput = new Map<string, string>();
  const targetOfGenerator = new Map<string, string>();
  for (const edge of edges) {
    sourceOfInput.set(edge.target, edge.source);
    if (nodeById.get(edge.source)?.type === 'generator') {
      targetOfGenerator.set(edge.source, edge.target);
    }
  }
  return { nodeById, sourceOfInput, targetOfGenerator };
};

export const canConnect = (
  { source, target }: Pick<Connection, 'source' | 'target'>,
  indexes: GraphIndexes,
) => {
  const from = indexes.nodeById.get(source)?.type;
  const to = indexes.nodeById.get(target)?.type;
  const compatible =
    (from === 'prompt' && to === 'generator') || (from === 'generator' && to === 'result');
  return compatible && !indexes.sourceOfInput.has(target) && !indexes.targetOfGenerator.has(source);
};

export const completeChain = (generatorId: string, indexes: GraphIndexes): Chain | null => {
  if (indexes.nodeById.get(generatorId)?.type !== 'generator') return null;
  const resultNodeId = indexes.targetOfGenerator.get(generatorId);
  const promptId = indexes.sourceOfInput.get(generatorId);
  const prompt = promptId === undefined ? undefined : indexes.nodeById.get(promptId);
  if (resultNodeId === undefined || prompt?.type !== 'prompt') return null;
  return prompt.data.text.trim() ? { promptText: prompt.data.text, resultNodeId } : null;
};
