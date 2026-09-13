import { useId } from 'react';

import { Handle, type NodeProps, Position } from '@xyflow/react';

import { Label } from '@/shared/ui/shadcn/label';
import { nodeTypeLabels, type PromptNode as PromptNodeType, useGraphStore } from '@/entities/graph';

import { NodeFrame } from './NodeFrame';

export const PromptNode = ({ id, data, selected }: NodeProps<PromptNodeType>) => {
  const setPromptText = useGraphStore((state) => state.setPromptText);
  const fieldId = useId();

  return (
    <NodeFrame id={id} title={nodeTypeLabels.prompt} selected={selected}>
      <div className="flex flex-col gap-2">
        <Label htmlFor={fieldId}>Описание изображения</Label>
        <textarea
          id={fieldId}
          value={data.text}
          maxLength={2000}
          rows={3}
          onChange={(event) => setPromptText(id, event.target.value)}
          className="nodrag nowheel w-full resize-none border-b-2 border-hairline bg-transparent text-body text-ink transition-colors outline-none focus-visible:border-ink"
        />
      </div>
      <Handle type="source" position={Position.Right} />
    </NodeFrame>
  );
};
