import { describe, expect, it } from 'vitest';

import { titleError } from '../space-title';

describe('titleError', () => {
  it('пустое или пробельное название не проходит', () => {
    expect(titleError('')).toBe('Введите название пространства');
    expect(titleError('   ')).toBe('Введите название пространства');
  });

  it('название длиннее 80 символов не проходит', () => {
    expect(titleError('а'.repeat(81))).toBe('Не длиннее 80 символов');
  });

  it('обычное название проходит', () => {
    expect(titleError('Мой канвас')).toBeNull();
  });
});
