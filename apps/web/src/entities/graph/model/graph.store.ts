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

import { canConnect, type GraphIndexes, indexGraph } from './graph-rules';
import {
  type GraphEdge,
  type GraphNode,
  type GraphNodeType,
  type GraphSnapshot,
} from './graph.types';
import { serializeGraph } from './to-graph';

export interface ServerGraph {
  graph: GraphData;
  etag: string;
}

export type Scenario = 'success' | 'failure';

export interface GraphStoreOptions {
  spaceId: string;
  graph: GraphData;
  etag: string;
  delayMs: number;
  save: (json: string, etag: string) => Promise<string>;
  readServer: () => Promise<ServerGraph>;
  shouldHalt: (error: unknown) => boolean;
}

export interface GraphState extends GraphSnapshot {
  spaceId: string;
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
  connectSelected: () => void;
  flush: () => Promise<string>;
  overwriteServer: () => Promise<string>;
}

export const nodeTypeLabels: Record<GraphNodeType, string> = {
  prompt: 'Текст',
  generator: 'Генератор',
  result: 'Результат',
};

const ariaLabelFor = (type: GraphNodeType, ordinal: number) => `${nodeTypeLabels[type]} ${ordinal}`;

const countOfType = (nodes: readonly GraphNode[], type: GraphNodeType) => {
  let count = 0;
  for (const node of nodes) if (node.type === type) count += 1;
  return count;
};

const withAriaLabels = (nodes: GraphData['nodes']): GraphNode[] => {
  const seen: Record<GraphNodeType, number> = { prompt: 0, generator: 0, result: 0 };
  return nodes.map((node) => {
    seen[node.type] += 1;
    return { ...node, ariaLabel: ariaLabelFor(node.type, seen[node.type]) };
  });
};

const createNode = (type: GraphNodeType, position: XYPosition, ordinal: number): GraphNode => {
  const id = crypto.randomUUID();
  const ariaLabel = ariaLabelFor(type, ordinal);
  if (type === 'prompt') return { id, type, position, data: { text: '' }, ariaLabel };
  return { id, type, position, data: { label: nodeTypeLabels[type] }, ariaLabel };
};

const edgeLabel = (source: GraphNode | undefined, target: GraphNode | undefined) =>
  `Связь: ${source?.ariaLabel ?? '?'} → ${target?.ariaLabel ?? '?'}`;

const withEdgeLabels = (edges: GraphData['edges'], nodeById: Map<string, GraphNode>) =>
  edges.map((edge) => ({
    ...edge,
    ariaLabel: edgeLabel(nodeById.get(edge.source), nodeById.get(edge.target)),
  }));

export const selectedPair = (nodes: readonly GraphNode[]): [GraphNode, GraphNode] | null => {
  const picked: GraphNode[] = [];
  for (const node of nodes) {
    if (!node.selected) continue;
    if (picked.length === 2) return null;
    picked.push(node);
  }
  const [first, second] = picked;
  return first && second ? [first, second] : null;
};

export const connectableSelection = (
  nodes: readonly GraphNode[],
  indexes: GraphIndexes,
): Connection | null => {
  const pair = selectedPair(nodes);
  if (!pair) return null;
  const [a, b] = pair;
  const forward = { source: a.id, target: b.id, sourceHandle: null, targetHandle: null };
  if (canConnect(forward, indexes)) return forward;
  const backward = { source: b.id, target: a.id, sourceHandle: null, targetHandle: null };
  return canConnect(backward, indexes) ? backward : null;
};

const savingNodeChanges = new Set<NodeChange['type']>(['add', 'remove', 'replace', 'position']);
const structuralNodeChanges = new Set<NodeChange['type']>(['add', 'remove', 'replace']);
const savingEdgeChanges = new Set<EdgeChange['type']>(['add', 'remove', 'replace']);

const hasType = <T extends { type: string }>(changes: T[], types: Set<T['type']>) => {
  for (const change of changes) if (types.has(change.type)) return true;
  return false;
};

export const createGraphStore = ({
  spaceId,
  graph,
  etag,
  delayMs,
  save,
  readServer,
  shouldHalt,
}: GraphStoreOptions) =>
  createStore<GraphState>((set, get) => {
    let lastSentJson = serializeGraph(graph);
    let lostAnswerFor: string | null = null;

    const adopt = (json: string, etag: string) => {
      lastSentJson = json;
      lostAnswerFor = null;
      set({ etag });
      return etag;
    };

    const alreadyOnServer = async (json: string) => {
      const server = await readServer();
      return serializeGraph(server.graph) === json ? server.etag : null;
    };

    const saver = createSerialSaver<GraphSnapshot, string>({
      delayMs,
      shouldHalt,
      save: async (snapshot) => {
        const json = serializeGraph(snapshot);
        if (json === lastSentJson) return get().etag;
        const landed = lostAnswerFor === json ? await alreadyOnServer(json) : null;
        if (landed !== null) return adopt(json, landed);
        try {
          return adopt(json, await save(json, get().etag));
        } catch (error) {
          if (!shouldHalt(error)) lostAnswerFor = json;
          throw error;
        }
      },
    });
    saver.subscribe(() => set({ save: saver.getState() }));

    const schedule = () => saver.schedule(get());

    const setGraph = (nodes: GraphNode[], edges: GraphEdge[]) =>
      set({ nodes, edges, indexes: indexGraph(nodes, edges) });

    const initialNodes = withAriaLabels(graph.nodes);
    const initialIndexes = indexGraph(initialNodes, graph.edges);

    const connect = (connection: Connection) => {
      const { nodes, edges, indexes } = get();
      const edge: GraphEdge = {
        ...connection,
        id: crypto.randomUUID(),
        ariaLabel: edgeLabel(
          indexes.nodeById.get(connection.source),
          indexes.nodeById.get(connection.target),
        ),
      };
      setGraph(nodes, addEdge(edge, edges));
      schedule();
    };

    return {
      spaceId,
      nodes: initialNodes,
      edges: withEdgeLabels(graph.edges, initialIndexes.nodeById),
      viewport: graph.viewport,
      etag,
      save: saver.getState(),
      indexes: initialIndexes,
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

      onConnect: connect,

      connectSelected: () => {
        const connection = connectableSelection(get().nodes, get().indexes);
        if (connection) connect(connection);
      },

      setViewport: (viewport) => {
        set({ viewport });
        schedule();
      },

      setPromptText: (nodeId, text) => {
        const { nodes, indexes } = get();
        const node = indexes.nodeById.get(nodeId);
        if (node?.type !== 'prompt') return;
        const updated: GraphNode = { ...node, data: { text } };
        indexes.nodeById.set(nodeId, updated);
        set({
          nodes: nodes.map((item) => (item.id === nodeId ? updated : item)),
          indexes: { ...indexes },
        });
        schedule();
      },

      addNode: (type, position) => {
        const { nodes, edges } = get();
        if (nodes.length >= maxNodes) return;
        setGraph([...nodes, createNode(type, position, countOfType(nodes, type) + 1)], edges);
        schedule();
      },

      setScenario: (nodeId, scenario) =>
        set({ scenarios: { ...get().scenarios, [nodeId]: scenario } }),

      flush: async () => (await saver.flush()) ?? get().etag,

      overwriteServer: async () => {
        set({ etag: (await readServer()).etag });
        saver.resume();
        return (await saver.flush()) ?? get().etag;
      },
    };
  });

export type GraphStore = ReturnType<typeof createGraphStore>;
