import {
  type GeneratorNode,
  type GraphEdge,
  type GraphSnapshot,
  type PromptNode,
  type ResultNode,
} from '@/entities/graph';

export const nodeId = (n: number) => `10000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

export const promptId = nodeId(1);
export const generatorId = nodeId(2);
export const resultId = nodeId(3);

export const makePromptNode = (text = 'Горы на рассвете', id = promptId): PromptNode => ({
  id,
  type: 'prompt',
  position: { x: 0, y: 0 },
  data: { text },
});

export const makeGeneratorNode = (id = generatorId): GeneratorNode => ({
  id,
  type: 'generator',
  position: { x: 320, y: 0 },
  data: { label: 'Генератор' },
});

export const makeResultNode = (id = resultId): ResultNode => ({
  id,
  type: 'result',
  position: { x: 640, y: 0 },
  data: { label: 'Результат' },
});

export const makeEdge = (
  source: string,
  target: string,
  id = `${source}->${target}`,
): GraphEdge => ({
  id,
  source,
  target,
});

export const chainGraph = (): GraphSnapshot => ({
  nodes: [makePromptNode(), makeGeneratorNode(), makeResultNode()],
  edges: [makeEdge(promptId, generatorId), makeEdge(generatorId, resultId)],
  viewport: { x: 0, y: 0, zoom: 1 },
});
