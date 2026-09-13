import { useNavigate } from 'react-router';

import { ErrorBar } from '@/shared/ui/ErrorBar';
import { PageTitle } from '@/shared/ui/PageTitle';
import { useSpaces } from '@/entities/space';

import { CreateSpaceForm } from './CreateSpaceForm';
import { SpacesList } from './SpacesList';

export const SpacesPage = () => {
  const navigate = useNavigate();
  const { spaces, isLoading, error, refetch } = useSpaces();

  return (
    <div className="mx-auto w-full max-w-7xl px-3 pt-12 pb-16 md:px-5">
      <PageTitle>Пространства</PageTitle>
      <CreateSpaceForm onCreated={(space) => void navigate(`/spaces/${space.id}`)} />
      {error && <ErrorBar error={error} onRetry={refetch} />}
      <SpacesList spaces={spaces} isLoading={isLoading} />
    </div>
  );
};
