import { Link } from 'react-router';

import { type SpaceData } from '@canvas/contracts';

import { formatDateTime } from '@/shared/lib/date';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';

interface SpacesListProps {
  spaces: SpaceData[];
  isLoading: boolean;
}

const rowClass =
  'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hairline py-3';

export const SpacesList = ({ spaces, isLoading }: SpacesListProps) => {
  if (isLoading) {
    return (
      <div role="status" aria-busy="true" className="border-t border-hairline">
        <span className="sr-only">Загружаем пространства</span>
        <div className={rowClass}>
          <Skeleton className="h-5 w-1/3 bg-surface" />
          <Skeleton className="h-4 w-24 bg-surface" />
        </div>
        <div className={rowClass}>
          <Skeleton className="h-5 w-1/4 bg-surface" />
          <Skeleton className="h-4 w-24 bg-surface" />
        </div>
      </div>
    );
  }

  if (spaces.length === 0) {
    return <p className="text-display">Пространств пока нет. Создайте первое в форме выше.</p>;
  }

  return (
    <ul className="border-t border-hairline">
      {spaces.map((space) => (
        <li key={space.id} className={rowClass}>
          <Link to={`/spaces/${space.id}`} className="underline underline-offset-2">
            {space.title}
          </Link>
          <span className="text-caption text-muted">{formatDateTime(space.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
};
