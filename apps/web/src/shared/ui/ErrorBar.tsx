import { type ApiError } from '@/shared/api/error';
import { TextAction } from '@/shared/ui/TextAction';

interface ErrorBarProps {
  error: ApiError;
  onRetry?: () => unknown;
}

export const ErrorBar = ({ error, onRetry }: ErrorBarProps) => (
  <div
    role="alert"
    className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 bg-surface px-4 py-3"
  >
    <span>{error.message}</span>
    {onRetry && (
      <TextAction glyph="arrow" onClick={() => void onRetry()}>
        Повторить
      </TextAction>
    )}
  </div>
);
