import { Handle, type NodeProps, Position } from '@xyflow/react';

import { type ResultNode as ResultNodeType } from '../model/graph.types';
import { NodeFrame } from './NodeFrame';

export const ResultNode = ({ id, data, selected }: NodeProps<ResultNodeType>) => (
  <NodeFrame id={id} title={data.label} selected={selected}>
    <div className="flex aspect-4/3 items-center justify-center bg-page text-caption text-muted">
      Нет результата
    </div>
    <Handle type="target" position={Position.Left} />
  </NodeFrame>
);
