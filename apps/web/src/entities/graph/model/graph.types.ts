import { type Edge, type Node, type Viewport } from '@xyflow/react';

import { type NodeData } from '@canvas/contracts';

type DataOf<T extends NodeData['type']> = Extract<NodeData, { type: T }>['data'];

export type PromptNode = Node<DataOf<'prompt'>, 'prompt'>;
export type GeneratorNode = Node<DataOf<'generator'>, 'generator'>;
export type ResultNode = Node<DataOf<'result'>, 'result'>;
export type GraphNode = PromptNode | GeneratorNode | ResultNode;
export type GraphNodeType = GraphNode['type'];
export type GraphEdge = Edge;

export interface GraphSnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
  viewport: Viewport;
}
