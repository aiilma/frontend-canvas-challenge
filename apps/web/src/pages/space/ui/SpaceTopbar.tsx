import { useReactFlow } from '@xyflow/react';
import { Link } from 'react-router';

import { maxNodes } from '@/shared/config/limits';
import { TextAction } from '@/shared/ui/TextAction';
import { type GraphNodeType, useGraphStore } from '@/entities/graph';

import { SaveStatus } from './SaveStatus';

interface SpaceTopbarProps {
  title: string;
}

const nodeActions: { type: GraphNodeType; label: string }[] = [
  { type: 'prompt', label: 'Текст' },
  { type: 'generator', label: 'Генератор' },
  { type: 'result', label: 'Результат' },
];

export const SpaceTopbar = ({ title }: SpaceTopbarProps) => {
  const count = useGraphStore((state) => state.nodes.length);
  const addNode = useGraphStore((state) => state.addNode);
  const { screenToFlowPosition } = useReactFlow();
  const isFull = count >= maxNodes;

  const handleAdd = (type: GraphNodeType) => {
    const column = count % 3;
    const row = Math.floor(count / 3) % 3;
    addNode(
      type,
      screenToFlowPosition({
        x: window.innerWidth / 2 + (column - 1) * 300 - 120,
        y: window.innerHeight / 2 + row * 240 - 100,
      }),
    );
  };

  return (
    <header className="flex min-h-13 shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-1 bg-page px-3 py-2 md:px-5">
      <div className="flex min-w-0 items-baseline gap-3">
        <Link to="/" className="font-medium">
          Canvas
        </Link>
        <span className="truncate text-muted">{title}</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
        <SaveStatus />
        <nav aria-label="Добавить ноду" className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {nodeActions.map(({ type, label }) => (
            <TextAction key={type} glyph="plus" disabled={isFull} onClick={() => handleAdd(type)}>
              {label}
            </TextAction>
          ))}
          {isFull && <span className="text-caption text-muted">Максимум {maxNodes} нод</span>}
        </nav>
      </div>
    </header>
  );
};
