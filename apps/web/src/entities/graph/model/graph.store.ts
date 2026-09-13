import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type Viewport,
  type XYPosition,
} from '@xyflow/react';
import { createStore } from 'zustand';

import { type GraphData } from '@canvas/contracts';

import { maxNodes } from '@/shared/config/limits';
import { createSerialSaver, type SaverState } from '@/shared/lib/serial-saver';

import { type GraphIndexes, indexGraph } from './graph-rules';
import {
  type GraphEdge,
  type GraphNode,
  type GraphNodeType,
  type GraphSnapshot,
} from './graph.types';
import { serializeGraph } from './to-graph';

export type Scenario = 'success' | 'failure';

export interface GraphStoreOptions {
  graph: GraphData;
  etag: string;
  delayMs: number;
  save: (json: string, etag: string) => Promise<string>;
  readEtag: () => Promise<string>;
  shouldHalt: (error: unknown) => boolean;
}

export interface GraphState extends GraphSnapshot {
  etag: string;
  save: SaverState;
  indexes: GraphIndexes;
  scenarios: Record<string, Scenario>;
  onNodesChange: (changes: NodeChange<GraphNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<GraphEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  setViewport: (viewport: Viewport) => void;
  setPromptText: (nodeId: string, text: string) => void;
  addNode: (type: GraphNodeType, position: XYPosition) => void;
  setScenario: (nodeId: string, scenario: Scenario) => void;
  flush: () => Promise<string | undefined>;
  overwriteServer: () => Promise<string | undefined>;
}

const labels: Record<Exclude<GraphNodeType, 'prompt'>, string> = {
  generator: 'Генератор',
  result: 'Результат',
};

const createNode = (type: GraphNodeType, position: XYPosition): GraphNode => {
  const id = crypto.randomUUID();
  if (type === 'prompt') return { id, type, position, data: { text: '' } };
  return { id, type, position, data: { label: labels[type] } };
};

const savingNodeChanges = new Set<NodeChange['type']>(['add', 'remove', 'replace', 'position']);
const structuralNodeChanges = new Set<NodeChange['type']>(['add', 'remove', 'replace']);
const savingEdgeChanges = new Set<EdgeChange['type']>(['add', 'remove', 'replace']);

const hasType = <T extends { type: string }>(changes: T[], types: Set<T['type']>) => {
  for (const change of changes) if (types.has(change.type)) return true;
  return false;
};

export const createGraphStore = ({
  graph,
  etag,
  delayMs,
  save,
  readEtag,
  shouldHalt,
}: GraphStoreOptions) =>
  createStore<GraphState>((set, get) => {
    let lastSentJson = JSON.stringify(graph);

    const saver = createSerialSaver<GraphSnapshot, string>({
      delayMs,
      shouldHalt,
      save: async (snapshot) => {
        const json = serializeGraph(snapshot);
        if (json === lastSentJson) return get().etag;
        const nextEtag = await save(json, get().etag);
        lastSentJson = json;
        set({ etag: nextEtag });
        return nextEtag;
      },
    });
    saver.subscribe(() => set({ save: saver.getState() }));

    const schedule = () => saver.schedule(get());

    const setGraph = (nodes: GraphNode[], edges: GraphEdge[]) =>
      set({ nodes, edges, indexes: indexGraph(nodes, edges) });

    return {
      nodes: graph.nodes,
      edges: graph.edges,
      viewport: graph.viewport,
      etag,
      save: saver.getState(),
      indexes: indexGraph(graph.nodes, graph.edges),
      scenarios: {},

      onNodesChange: (changes) => {
        const nodes = applyNodeChanges(changes, get().nodes);
        if (hasType(changes, structuralNodeChanges)) setGraph(nodes, get().edges);
        else set({ nodes });
        if (hasType(changes, savingNodeChanges)) schedule();
      },

      onEdgesChange: (changes) => {
        const edges = applyEdgeChanges(changes, get().edges);
        if (hasType(changes, savingEdgeChanges)) {
          setGraph(get().nodes, edges);
          schedule();
        } else set({ edges });
      },

      onConnect: (connection) => {
        setGraph(get().nodes, addEdge({ ...connection, id: crypto.randomUUID() }, get().edges));
        schedule();
      },

      setViewport: (viewport) => {
        set({ viewport });
        schedule();
      },

      setPromptText: (nodeId, text) => {
        const nodes = get().nodes.map((node) =>
          node.id === nodeId && node.type === 'prompt' ? { ...node, data: { text } } : node,
        );
        setGraph(nodes, get().edges);
        schedule();
      },

      addNode: (type, position) => {
        const { nodes, edges } = get();
        if (nodes.length >= maxNodes) return;
        setGraph([...nodes, createNode(type, position)], edges);
        schedule();
      },

      setScenario: (nodeId, scenario) =>
        set({ scenarios: { ...get().scenarios, [nodeId]: scenario } }),

      flush: () => saver.flush(),

      overwriteServer: async () => {
        set({ etag: await readEtag() });
        saver.resume();
        return saver.flush();
      },
    };
  });

export type GraphStore = ReturnType<typeof createGraphStore>;
