import { type GraphData, type NodeData } from '@canvas/contracts';

import { type GraphEdge, type GraphNode, type GraphSnapshot } from './graph.types';

const projectNode = (node: GraphNode): NodeData => {
  const position = { x: node.position.x, y: node.position.y };
  switch (node.type) {
    case 'prompt':
      return { id: node.id, type: node.type, position, data: { text: node.data.text } };
    case 'generator':
    case 'result':
      return { id: node.id, type: node.type, position, data: { label: node.data.label } };
  }
};

const projectEdge = (edge: GraphEdge): GraphData['edges'][number] => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
});

export const toGraph = ({ nodes, edges, viewport }: GraphSnapshot): GraphData => ({
  nodes: nodes.map(projectNode),
  edges: edges.map(projectEdge),
  viewport: { x: viewport.x, y: viewport.y, zoom: viewport.zoom },
});

export const serializeGraph = (snapshot: GraphSnapshot) => JSON.stringify(toGraph(snapshot));
