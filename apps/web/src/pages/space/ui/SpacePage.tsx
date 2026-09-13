import { ReactFlowProvider } from '@xyflow/react';
import { useParams } from 'react-router';

import { ButtonLink } from '@/shared/ui/ButtonLink';
import { ErrorBar } from '@/shared/ui/ErrorBar';
import { GraphStoreProvider, useGraph } from '@/entities/graph';
import { useSpace } from '@/entities/space';

import { ConflictBar } from './ConflictBar';
import { SpaceCanvas } from './SpaceCanvas';
import { SpaceTopbar } from './SpaceTopbar';

const SpaceBody = ({ spaceId }: { spaceId: string }) => {
  const { space, error: spaceError, refetch: refetchSpace } = useSpace(spaceId);
  const { versioned, isLoading, error, refetch } = useGraph(spaceId);
  const failure = error ?? spaceError;

  if (failure?.status === 404) {
    return (
      <div className="flex flex-col items-start gap-6 px-5 pt-12">
        <p className="text-display">Пространство не найдено.</p>
        <ButtonLink variant="text" glyph="arrow" to="/">
          К списку
        </ButtonLink>
      </div>
    );
  }

  if (failure) {
    return (
      <div className="px-5 pt-12">
        <ErrorBar error={failure} onRetry={() => Promise.all([refetch(), refetchSpace()])} />
      </div>
    );
  }

  if (isLoading || !versioned) {
    return (
      <p className="px-5 pt-12 text-muted" aria-busy="true">
        Загружаем пространство
      </p>
    );
  }

  return (
    <GraphStoreProvider key={versioned.etag} spaceId={spaceId} {...versioned}>
      <ReactFlowProvider>
        <SpaceTopbar title={space?.title ?? ''} />
        <ConflictBar onReload={() => void refetch()} />
        <SpaceCanvas />
      </ReactFlowProvider>
    </GraphStoreProvider>
  );
};

export const SpacePage = () => {
  const { spaceId = '' } = useParams();

  return (
    <div className="flex h-dvh flex-col">
      <SpaceBody spaceId={spaceId} />
    </div>
  );
};
