import { createContext, useContext } from 'react';

import { useStore } from 'zustand';

import { type GraphState, type GraphStore } from './graph.store';

export const GraphStoreContext = createContext<GraphStore | null>(null);

export const useGraphStoreApi = () => {
  const store = useContext(GraphStoreContext);
  if (!store) throw new Error('GraphStoreProvider отсутствует выше по дереву');
  return store;
};

export const useGraphStore = <T>(selector: (state: GraphState) => T) =>
  useStore(useGraphStoreApi(), selector);
