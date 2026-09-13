import { type GenerationData } from '@canvas/contracts';

import { generatorId, promptId, resultId } from './graph';
import { spaceId } from './space';

let counter = 0;

export const makeGeneration = (overrides: Partial<GenerationData> = {}): GenerationData => {
  counter += 1;
  const id = overrides.id ?? `40000000-0000-4000-8000-${String(counter).padStart(12, '0')}`;
  const status = overrides.status ?? 'processing';
  return {
    id,
    spaceId,
    nodeId: generatorId,
    resultNodeId: resultId,
    prompt: 'Горы на рассвете',
    graphETag: '"0"',
    scenario: 'success',
    status,
    createdAt: '2026-09-12T10:00:00.000Z',
    imageUrl: status === 'succeeded' ? '/assets/demo.svg' : null,
    failureCode: status === 'failed' ? 'SIMULATED_FAILURE' : null,
    links: {
      self: { href: `/api/spaces/${spaceId}/generations/${id}`, method: 'GET' },
      graph: { href: `/api/spaces/${spaceId}/graph`, method: 'GET' },
    },
    ...overrides,
  };
};

export { generatorId, promptId, resultId };
