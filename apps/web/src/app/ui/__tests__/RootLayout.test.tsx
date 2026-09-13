import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@test/utils/render';

import { RootLayout } from '../RootLayout';

describe('RootLayout', () => {
  it('показывает шапку и содержимое страницы', () => {
    renderWithProviders(
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<p>Содержимое страницы</p>} />
        </Route>
      </Routes>,
    );

    expect(screen.getByRole('link', { name: 'Canvas' })).toHaveAttribute('href', '/');
    expect(screen.getByText('Содержимое страницы')).toBeVisible();
  });
});
