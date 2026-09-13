import { type ReactNode } from 'react';
import { useReactFlow } from '@xyflow/react';

import { cn } from '@/shared/lib/cn';
import { TextAction } from '@/shared/ui/TextAction';

interface NodeFrameProps {
  id: string;
  title: string;
  selected: boolean;
  failed?: boolean;
  children: ReactNode;
}

export const NodeFrame = ({ id, title, selected, failed = false, children }: NodeFrameProps) => {
  const { deleteElements } = useReactFlow();

  return (
    <div
      className={cn(
        'relative flex w-60 flex-col gap-3 border bg-surface p-3',
        failed ? 'border-accent' : selected ? 'border-ink' : 'border-hairline',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption text-muted uppercase">{title}</span>
        <TextAction
          glyph="arrow"
          className="nodrag text-caption"
          onClick={() => void deleteElements({ nodes: [{ id }] })}
        >
          Удалить
        </TextAction>
      </div>
      {children}
    </div>
  );
};
