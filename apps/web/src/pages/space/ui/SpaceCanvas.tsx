import {
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type Edge,
  ReactFlow,
} from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import { canConnect, nodeTypes, useGraphStore, useGraphStoreApi } from '@/entities/graph';

const nodeExtent: [[number, number], [number, number]] = [
  [-10000, -10000],
  [10000, 10000],
];

const deleteKeys = ['Backspace', 'Delete'];

export const SpaceCanvas = () => {
  const store = useGraphStoreApi();
  const { nodes, edges, viewport, onNodesChange, onEdgesChange, onConnect, setViewport } =
    useGraphStore(
      useShallow((state) => ({
        nodes: state.nodes,
        edges: state.edges,
        viewport: state.viewport,
        onNodesChange: state.onNodesChange,
        onEdgesChange: state.onEdgesChange,
        onConnect: state.onConnect,
        setViewport: state.setViewport,
      })),
    );

  const isValidConnection = (connection: Connection | Edge) =>
    canConnect(connection, store.getState().indexes);

  return (
    <main className="min-h-0 flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        onMoveEnd={(_, next) => setViewport(next)}
        defaultViewport={viewport}
        minZoom={0.1}
        maxZoom={4}
        nodeExtent={nodeExtent}
        deleteKeyCode={deleteKeys}
        edgesReconnectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </main>
  );
};
