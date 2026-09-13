import { type SaverStatus } from '@/shared/lib/serial-saver';

export const saveStatusLabel: Record<SaverStatus, string> = {
  idle: 'Сохранено',
  dirty: 'Не сохранено',
  saving: 'Сохраняем…',
  error: 'Не удалось сохранить',
  halted: 'Конфликт версии',
};
