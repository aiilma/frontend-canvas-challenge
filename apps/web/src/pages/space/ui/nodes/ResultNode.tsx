import { Handle, type NodeProps, Position } from '@xyflow/react';

import { apiBaseUrl } from '@/shared/config/env';
import { type ResultNode as ResultNodeType, useGraphStore } from '@/entities/graph';
import { resultFor, useGenerations } from '@/entities/generation';

import { NodeFrame } from './NodeFrame';

export const ResultNode = ({ id, data, selected }: NodeProps<ResultNodeType>) => {
  const spaceId = useGraphStore((state) => state.spaceId);
  const { index } = useGenerations(spaceId);
  const result = index ? resultFor(id, index) : null;
  const latest = index?.byResult.get(id);
  const placeholder =
    latest?.status === 'failed' ? 'Отказ генерации. Повторите в генераторе.' : 'Нет результата';

  return (
    <NodeFrame id={id} title={data.label} selected={selected}>
      {result?.imageUrl ? (
        <img
          src={`${apiBaseUrl}${result.imageUrl}`}
          alt={`Изображение по описанию: ${result.prompt}`}
          decoding="async"
          className="aspect-4/3 w-full bg-page object-cover"
        />
      ) : (
        <div className="flex aspect-4/3 items-center justify-center bg-page px-3 text-center text-caption text-muted">
          {placeholder}
        </div>
      )}
      <Handle type="target" position={Position.Left} />
    </NodeFrame>
  );
};
