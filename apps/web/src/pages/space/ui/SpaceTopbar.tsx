import { useReactFlow } from '@xyflow/react';

import { maxNodes } from '@/shared/config/limits';
import { TextAction } from '@/shared/ui/TextAction';
import { Wordmark } from '@/shared/ui/Wordmark';
import {
  connectableSelection,
  type GraphNodeType,
  nodeTypeLabels,
  useGraphStore,
} from '@/entities/graph';

import { SaveStatus } from './SaveStatus';

interface SpaceTopbarProps {
  title: string;
}

const addableTypes: GraphNodeType[] = ['prompt', 'generator', 'result'];
const columns = 3;
const columnStep = 300;
const rowStep = 240;
const nodeWidth = 240;
const nodeHeight = 200;

const nextPosition = (count: number) => ({
  x: window.innerWidth / 2 + ((count % columns) - 1) * columnStep - nodeWidth / 2,
  y: window.innerHeight / 2 + (Math.floor(count / columns) % columns) * rowStep - nodeHeight / 2,
});

export const SpaceTopbar = ({ title }: SpaceTopbarProps) => {
  const count = useGraphStore((state) => state.nodes.length);
  const addNode = useGraphStore((state) => state.addNode);
  const connectSelected = useGraphStore((state) => state.connectSelected);
  const canConnectSelected = useGraphStore(
    (state) => connectableSelection(state.nodes, state.indexes) !== null,
  );
  const { screenToFlowPosition } = useReactFlow();
  const isFull = count >= maxNodes;

  const handleAdd = (type: GraphNodeType) =>
    addNode(type, screenToFlowPosition(nextPosition(count)));

  return (
    <header className="flex min-h-13 shrink-0 flex-wrap items-center gap-x-12 gap-y-1 bg-page px-3 py-2 md:px-5">
      <div className="flex min-w-0 grow items-baseline gap-3">
        <Wordmark />
        <h1 className="truncate text-body text-muted" title={title}>
          {title}
        </h1>
        <SaveStatus className="ms-auto" />
      </div>
      <div
        role="group"
        aria-label="Действия с нодами"
        className="ms-auto flex flex-wrap items-center gap-x-6 gap-y-1"
      >
        {addableTypes.map((type) => (
          <TextAction key={type} glyph="plus" disabled={isFull} onClick={() => handleAdd(type)}>
            {nodeTypeLabels[type]}
          </TextAction>
        ))}
        {isFull && <span className="text-caption text-muted">Максимум {maxNodes} нод</span>}
        <TextAction glyph="arrow" disabled={!canConnectSelected} onClick={connectSelected}>
          Соединить выбранные
        </TextAction>
      </div>
    </header>
  );
};
