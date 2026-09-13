import { describe, expect, it } from 'vitest';

import { makeGeneration } from '@test/factories/generation';
import { generatorId, nodeId, resultId } from '@test/factories/graph';

import { hasProcessing, indexGenerations, resultFor } from '../generation-index';

const otherResult = nodeId(23);

describe('indexGenerations', () => {
  it('берёт последнюю попытку по генератору и по ноде результата, список идёт от новых к старым', () => {
    const newest = makeGeneration({ status: 'processing' });
    const older = makeGeneration({ status: 'succeeded' });
    const index = indexGenerations([newest, older]);

    expect(index.byGenerator.get(generatorId)).toBe(newest);
    expect(index.byResult.get(resultId)).toBe(newest);
    expect(index.processing).toEqual([generatorId]);
  });

  it('готовый результат показывается только для последней попытки своего генератора', () => {
    const done = makeGeneration({ status: 'succeeded' });
    expect(resultFor(resultId, indexGenerations([done]))).toBe(done);

    const rewired = makeGeneration({ status: 'succeeded', resultNodeId: otherResult });
    const index = indexGenerations([rewired, done]);
    expect(resultFor(resultId, index)).toBeNull();
    expect(resultFor(otherResult, index)).toBe(rewired);
  });

  it('отказ и обработка не дают результата', () => {
    expect(
      resultFor(resultId, indexGenerations([makeGeneration({ status: 'failed' })])),
    ).toBeNull();
    expect(resultFor(resultId, indexGenerations([makeGeneration()]))).toBeNull();
  });

  it('опрос нужен, пока есть незавершённая генерация', () => {
    expect(hasProcessing([makeGeneration({ status: 'succeeded' }), makeGeneration()])).toBe(true);
    expect(hasProcessing([makeGeneration({ status: 'failed' })])).toBe(false);
  });
});
