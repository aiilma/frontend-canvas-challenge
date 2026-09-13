import { type ReactNode } from 'react';

import { useReactFlow } from '@xyflow/react';

import { cn } from '@/shared/lib/cn';
import { TextAction } from '@/shared/ui/TextAction';
import { useGraphStore } from '@/entities/graph';

interface NodeFrameProps {
  id: string;
  title: string;
  selected: boolean;
  failed?: boolean;
  children: ReactNode;
}

const borderClass = (failed: boolean, selected: boolean) => {
  if (failed) return 'border-accent';
  if (selected) return 'border-ink';
  return 'border-hairline';
};

const focusNextNode = () => {
  const node = document.querySelector<HTMLElement>('.react-flow__node');
  if (node) node.focus();
};

export const NodeFrame = ({ id, title, selected, failed = false, children }: NodeFrameProps) => {
  const { deleteElements } = useReactFlow();
  const ariaLabel = useGraphStore((state) => state.indexes.nodeById.get(id)?.ariaLabel ?? title);

  const handleDelete = () => {
    void deleteElements({ nodes: [{ id }] }).then(focusNextNode);
  };

  return (
    <div
      className={cn(
        'relative flex w-60 flex-col gap-4 border bg-surface p-3',
        borderClass(failed, selected),
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption text-muted uppercase">{title}</span>
        <TextAction
          glyph="arrow"
          className="nodrag text-caption"
          aria-label={`Удалить ноду «${ariaLabel}»`}
          onClick={handleDelete}
        >
          Удалить
        </TextAction>
      </div>
      {children}
    </div>
  );
};
