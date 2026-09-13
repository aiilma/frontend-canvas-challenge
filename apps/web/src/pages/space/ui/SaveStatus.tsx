import { TextAction } from '@/shared/ui/TextAction';
import { saveStatusLabel, useGraphStore } from '@/entities/graph';

export const SaveStatus = () => {
  const status = useGraphStore((state) => state.save.status);
  const flush = useGraphStore((state) => state.flush);

  return (
    <div role="status" className="flex items-center gap-2 text-caption text-muted">
      <span>{saveStatusLabel[status]}</span>
      {status === 'error' && (
        <TextAction glyph="arrow" className="text-caption" onClick={() => void flush()}>
          Повторить
        </TextAction>
      )}
    </div>
  );
};
