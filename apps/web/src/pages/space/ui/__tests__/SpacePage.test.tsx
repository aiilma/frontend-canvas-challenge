import { screen } from '@testing-library/react';
import { http } from 'msw';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { spaceId } from '@test/factories/space';
import { api, counting, errorResponse } from '@test/mocks/api';
import { server } from '@test/mocks/server';
import { renderWithProviders } from '@test/utils/render';

import { SpacePage } from '../SpacePage';

const renderPage = (id = spaceId) =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<p>Список пространств</p>} />
      <Route path="/spaces/:spaceId" element={<SpacePage />} />
    </Routes>,
    { route: `/spaces/${id}` },
  );

describe('SpacePage', () => {
  it('пока граф не загружен, показывает статус загрузки и ссылку на список', () => {
    renderPage();

    expect(screen.getByRole('status')).toHaveTextContent('Загружаем пространство');
    expect(screen.getByRole('link', { name: 'Canvas' })).toHaveAttribute('href', '/');
  });

  it('несуществующее пространство показывает 404 со ссылкой на список пространств', async () => {
    const missing = '30000000-0000-4000-8000-000000000404';
    server.use(
      http.get(api(`/api/spaces/${missing}`), () =>
        errorResponse(404, 'SPACE_NOT_FOUND', 'Рабочее пространство не найдено.'),
      ),
      http.get(api(`/api/spaces/${missing}/graph`), () =>
        errorResponse(404, 'SPACE_NOT_FOUND', 'Рабочее пространство не найдено.'),
      ),
    );
    renderPage(missing);

    expect(await screen.findByText('Пространство не найдено.')).toBeVisible();
    expect(screen.getByRole('link', { name: 'К списку пространств' })).toHaveAttribute('href', '/');
  });

  it('ошибка загрузки графа показывает сообщение сервера и повторяет запрос', async () => {
    const { resolve, calls } = counting(() =>
      errorResponse(500, 'INTERNAL_ERROR', 'Не удалось выполнить запрос.'),
    );
    server.use(http.get(api(`/api/spaces/${spaceId}/graph`), resolve));
    const { user } = renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось выполнить запрос.');
    await user.click(screen.getByRole('button', { name: 'Повторить' }));

    expect(calls()).toBe(2);
  });
});
