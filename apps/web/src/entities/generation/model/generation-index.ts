import { type GenerationData } from '@canvas/contracts';

export interface GenerationIndex {
  byGenerator: Map<string, GenerationData>;
  byResult: Map<string, GenerationData>;
  processing: Set<string>;
}

export const indexGenerations = (generations: GenerationData[]): GenerationIndex => {
  const byGenerator = new Map<string, GenerationData>();
  const byResult = new Map<string, GenerationData>();
  const processing = new Set<string>();
  for (const generation of generations) {
    if (!byGenerator.has(generation.nodeId)) {
      byGenerator.set(generation.nodeId, generation);
      if (generation.status === 'processing') processing.add(generation.nodeId);
    }
    if (!byResult.has(generation.resultNodeId)) byResult.set(generation.resultNodeId, generation);
  }
  return { byGenerator, byResult, processing };
};

export const attemptFor = (resultNodeId: string, index: GenerationIndex) => {
  const generation = index.byResult.get(resultNodeId);
  if (!generation || index.byGenerator.get(generation.nodeId) !== generation) return null;
  return generation;
};

export const hasProcessing = (generations: GenerationData[]) => {
  for (const generation of generations) if (generation.status === 'processing') return true;
  return false;
};
