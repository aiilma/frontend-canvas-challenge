import { type ReactNode } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { Link, useParams } from 'react-router';

import { ButtonLink } from '@/shared/ui/ButtonLink';
import { ErrorBar } from '@/shared/ui/ErrorBar';
import { SkipLink } from '@/shared/ui/SkipLink';
import { GraphStoreProvider, useGraph } from '@/entities/graph';
import { useSpace } from '@/entities/space';

import { ConflictBar } from './ConflictBar';
import { SpaceCanvas } from './SpaceCanvas';
import { SpaceTopbar } from './SpaceTopbar';

const Placeholder = ({ children }: { children: ReactNode }) => (
  <>
    <header className="flex min-h-13 items-center px-3 md:px-5">
      <Link to="/" className="font-medium">
        Canvas
      </Link>
    </header>
    <main id="main" className="flex flex-col items-start gap-6 px-3 pt-12 md:px-5">
      {children}
    </main>
  </>
);

const SpaceBody = ({ spaceId }: { spaceId: string }) => {
  const { space, error: spaceError, refetch: refetchSpace } = useSpace(spaceId);
  const { versioned, isLoading, error, refetch } = useGraph(spaceId);
  const failure = error ?? spaceError;

  if (failure?.status === 404) {
    return (
      <Placeholder>
        <p className="text-display">Пространство не найдено.</p>
        <ButtonLink variant="text" glyph="arrow" to="/">
          К списку пространств
        </ButtonLink>
      </Placeholder>
    );
  }

  if (failure) {
    return (
      <Placeholder>
        <ErrorBar error={failure} onRetry={() => Promise.all([refetch(), refetchSpace()])} />
      </Placeholder>
    );
  }

  if (isLoading || !versioned) {
    return (
      <Placeholder>
        <p role="status" className="text-caption text-muted">
          Загружаем пространство
        </p>
      </Placeholder>
    );
  }

  return (
    <GraphStoreProvider key={versioned.etag} spaceId={spaceId} {...versioned}>
      <ReactFlowProvider>
        <SpaceTopbar title={space?.title ?? ''} />
        <ConflictBar onReload={() => void refetch()} />
        <main id="main" className="min-h-0 flex-1">
          <SpaceCanvas />
        </main>
      </ReactFlowProvider>
    </GraphStoreProvider>
  );
};

export const SpacePage = () => {
  const { spaceId = '' } = useParams();

  return (
    <div className="flex h-dvh flex-col">
      <SkipLink />
      <SpaceBody spaceId={spaceId} />
    </div>
  );
};
