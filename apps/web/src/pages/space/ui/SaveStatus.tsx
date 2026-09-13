import { isApiError } from '@/shared/api/error';
import { cn } from '@/shared/lib/cn';
import { TextAction } from '@/shared/ui/TextAction';
import { saveStatusLabel, useGraphStore } from '@/entities/graph';

interface SaveStatusProps {
  className?: string;
}

export const SaveStatus = ({ className }: SaveStatusProps) => {
  const status = useGraphStore((state) => state.save.status);
  const saveError = useGraphStore((state) => state.save.error);
  const flush = useGraphStore((state) => state.flush);
  const isTrouble = status === 'error' || status === 'halted';
  const detail = status === 'error' && isApiError(saveError) ? `: ${saveError.message}` : '';

  return (
    <div
      role="status"
      className={cn(
        'flex items-center gap-2 text-caption',
        isTrouble ? 'text-warning' : 'text-muted',
        className,
      )}
    >
      <span>{`${saveStatusLabel[status]}${detail}`}</span>
      {status === 'error' && (
        <TextAction glyph="arrow" className="text-caption" onClick={() => void flush()}>
          Повторить
        </TextAction>
      )}
    </div>
  );
};
