import { type ReactNode, useEffect, useState } from 'react';

import { isApiError } from '@/shared/api/error';
import { saveDebounceMs } from '@/shared/config/limits';

import { getGraph, putGraph, type VersionedGraph } from '../api/graph.api';
import { GraphStoreContext } from '../model/graph-store-context';
import { createGraphStore } from '../model/graph.store';

interface GraphStoreProviderProps extends VersionedGraph {
  spaceId: string;
  children: ReactNode;
}

const isVersionConflict = (error: unknown) => isApiError(error) && error.status === 412;

export const GraphStoreProvider = ({ spaceId, graph, etag, children }: GraphStoreProviderProps) => {
  const [store] = useState(() =>
    createGraphStore({
      spaceId,
      graph,
      etag,
      delayMs: saveDebounceMs,
      save: (json, ifMatch) => putGraph(spaceId, json, ifMatch).then((saved) => saved.etag),
      readEtag: () => getGraph(spaceId).then((current) => current.etag),
      shouldHalt: isVersionConflict,
    }),
  );

  useEffect(
    () => () => {
      void store
        .getState()
        .flush()
        .catch(() => undefined);
    },
    [store],
  );

  return <GraphStoreContext value={store}>{children}</GraphStoreContext>;
};
