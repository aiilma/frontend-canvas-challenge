import { TextAction } from '@/shared/ui/TextAction';
import { useGraphStore } from '@/entities/graph';

interface ConflictBarProps {
  onReload: () => void;
}

export const ConflictBar = ({ onReload }: ConflictBarProps) => {
  const status = useGraphStore((state) => state.save.status);
  const overwriteServer = useGraphStore((state) => state.overwriteServer);

  if (status !== 'halted') return null;

  return (
    <div
      role="alert"
      className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 bg-surface px-3 py-3 md:px-5"
    >
      <span>Пространство изменено на сервере.</span>
      <TextAction glyph="arrow" onClick={onReload}>
        Перечитать
      </TextAction>
      <TextAction glyph="arrow" onClick={() => void overwriteServer()}>
        Записать мою версию
      </TextAction>
    </div>
  );
};
