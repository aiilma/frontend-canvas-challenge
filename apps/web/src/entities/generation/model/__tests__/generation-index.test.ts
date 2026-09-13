import { describe, expect, it } from 'vitest';

import { makeGeneration } from '@test/factories/generation';
import { generatorId, nodeId, resultId } from '@test/factories/graph';

import { attemptFor, hasProcessing, indexGenerations } from '../generation-index';

const otherResult = nodeId(23);

describe('indexGenerations', () => {
  it('берёт последнюю попытку по генератору и по ноде результата, список идёт от новых к старым', () => {
    const newest = makeGeneration({ status: 'processing' });
    const older = makeGeneration({ status: 'succeeded' });
    const index = indexGenerations([newest, older]);

    expect(index.byGenerator.get(generatorId)).toBe(newest);
    expect(index.byResult.get(resultId)).toBe(newest);
    expect([...index.processing]).toEqual([generatorId]);
  });

  it('нода результата видит только последнюю попытку своего генератора', () => {
    const done = makeGeneration({ status: 'succeeded' });
    expect(attemptFor(resultId, indexGenerations([done]))).toBe(done);

    const rewired = makeGeneration({ status: 'processing', resultNodeId: otherResult });
    const index = indexGenerations([rewired, done]);
    expect(attemptFor(resultId, index)).toBeNull();
    expect(attemptFor(otherResult, index)).toBe(rewired);
  });

  it('отказ переподключённого генератора не остаётся на прежней ноде результата', () => {
    const failed = makeGeneration({ status: 'failed' });
    expect(attemptFor(resultId, indexGenerations([failed]))).toBe(failed);

    const rewired = makeGeneration({ status: 'failed', resultNodeId: otherResult });
    expect(attemptFor(resultId, indexGenerations([rewired, failed]))).toBeNull();
  });

  it('опрос нужен, пока есть незавершённая генерация', () => {
    expect(hasProcessing([makeGeneration({ status: 'succeeded' }), makeGeneration()])).toBe(true);
    expect(hasProcessing([makeGeneration({ status: 'failed' })])).toBe(false);
  });
});
