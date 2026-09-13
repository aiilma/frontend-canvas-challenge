import { Link } from 'react-router';

import { type SpaceData } from '@canvas/contracts';

import { hoverUnderline } from '@/shared/lib/classes';
import { formatDateTime } from '@/shared/lib/date';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';

interface SpacesListProps {
  spaces: SpaceData[];
  isLoading: boolean;
}

export const SpacesList = ({ spaces, isLoading }: SpacesListProps) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <span className="sr-only">Загружаем пространства</span>
        <Skeleton className="h-6 w-2/3 bg-surface" />
        <Skeleton className="h-6 w-1/2 bg-surface" />
      </div>
    );
  }

  if (spaces.length === 0) return <p className="text-display">Пространств пока нет.</p>;

  return (
    <ul className="border-t border-hairline">
      {spaces.map((space) => (
        <li
          key={space.id}
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-hairline py-3"
        >
          <Link to={`/spaces/${space.id}`} className={hoverUnderline}>
            {space.title}
          </Link>
          <span className="text-caption text-muted">{formatDateTime(space.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
};
