import { useMemo } from 'react';

import {
  type AriaLabelConfig,
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type Edge,
  Panel,
  ReactFlow,
} from '@xyflow/react';
import { useShallow } from 'zustand/react/shallow';

import { canConnect, type GraphEdge, useGraphStore, useGraphStoreApi } from '@/entities/graph';
import { useGenerations } from '@/entities/generation';

import { nodeTypes } from './nodes/node-types';

const nodeExtent: [[number, number], [number, number]] = [
  [-10000, -10000],
  [10000, 10000],
];

const deleteKeys = ['Backspace', 'Delete'];

const ariaLabels: Partial<AriaLabelConfig> = {
  'node.a11yDescription.keyboardDisabled':
    'Enter или пробел выделяют ноду, стрелки двигают её, Delete удаляет, Escape снимает выделение.',
  'node.a11yDescription.default': 'Перемещение с клавиатуры отключено.',
  'node.a11yDescription.ariaLiveMessage': ({ direction, x, y }) =>
    `Нода сдвинута ${direction}, положение ${x}, ${y}.`,
  'edge.a11yDescription.default': 'Enter или пробел выделяют связь, Delete удаляет её.',
  'controls.ariaLabel': 'Масштаб канваса',
  'controls.zoomIn.ariaLabel': 'Приблизить',
  'controls.zoomOut.ariaLabel': 'Отдалить',
  'controls.fitView.ariaLabel': 'Показать всё',
  'handle.ariaLabel': 'Порт для связи',
};

const animateProcessing = (edges: GraphEdge[], processing: Set<string> | undefined) => {
  if (!processing?.size) return edges;
  return edges.map((edge) => (processing.has(edge.source) ? { ...edge, animated: true } : edge));
};

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
  const spaceId = useGraphStore((state) => state.spaceId);
  const { index } = useGenerations(spaceId);
  const processing = index?.processing;
  const shownEdges = useMemo(() => animateProcessing(edges, processing), [edges, processing]);

  const isValidConnection = (connection: Connection | Edge) =>
    canConnect(connection, store.getState().indexes);

  return (
    <ReactFlow
      nodes={nodes}
      edges={shownEdges}
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
      ariaLabelConfig={ariaLabels}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      <Controls showInteractive={false} />
      {nodes.length === 0 && (
        <Panel position="top-center" className="max-w-md pt-24 text-center">
          <p className="text-section">Канвас пуст.</p>
          <p className="mt-2 text-muted">
            Добавьте текст, генератор и результат из шапки, затем соедините порты или выделите две
            ноды и нажмите «Соединить выбранные».
          </p>
        </Panel>
      )}
    </ReactFlow>
  );
};
