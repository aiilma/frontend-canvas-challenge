import { screen } from '@testing-library/react';
import { http } from 'msw';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { makeSpace, spaceId } from '@test/factories/space';
import { api, counting, errorResponse, jsonResponse } from '@test/mocks/api';
import { server } from '@test/mocks/server';
import { renderWithProviders } from '@test/utils/render';

import { SpacesPage } from '../SpacesPage';

const listHandler = (spaces = [makeSpace()]) =>
  http.get(api('/api/spaces'), () => jsonResponse(spaces));

const renderPage = () =>
  renderWithProviders(
    <Routes>
      <Route index element={<SpacesPage />} />
      <Route path="/spaces/:spaceId" element={<p>Канвас открыт</p>} />
    </Routes>,
  );

describe('SpacesPage', () => {
  it('показывает пространства со ссылками на канвас', async () => {
    server.use(listHandler());
    renderPage();

    expect(await screen.findByRole('link', { name: 'Мой канвас' })).toHaveAttribute(
      'href',
      `/spaces/${spaceId}`,
    );
  });

  it('без пространств показывает пустое состояние', async () => {
    server.use(listHandler([]));
    renderPage();

    expect(await screen.findByText('Пространств пока нет.')).toBeVisible();
  });

  it('ошибка списка показывает полосу с повтором и перечитывает список', async () => {
    const { resolve, calls } = counting(() =>
      calls() === 1
        ? errorResponse(500, 'INTERNAL_ERROR', 'Не удалось')
        : jsonResponse([makeSpace()]),
    );
    server.use(http.get(api('/api/spaces'), resolve));
    const { user } = renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось');
    await user.click(screen.getByRole('button', { name: 'Повторить' }));

    expect(await screen.findByRole('link', { name: 'Мой канвас' })).toBeVisible();
  });

  it('пустое название не отправляется и подсвечивается', async () => {
    const { resolve, calls } = counting(() => jsonResponse(makeSpace(), { status: 201 }));
    server.use(listHandler([]), http.post(api('/api/spaces'), resolve));
    const { user } = renderPage();

    await user.click(await screen.findByRole('button', { name: 'Создать пространство' }));

    expect(screen.getByLabelText('Название пространства')).toHaveAccessibleDescription(
      'Введите название пространства',
    );
    expect(calls()).toBe(0);
  });

  it('после создания открывается канвас нового пространства', async () => {
    server.use(
      listHandler([]),
      http.post(api('/api/spaces'), async ({ request }) => {
        const { title } = (await request.json()) as { title: string };
        return jsonResponse(makeSpace({ title }), { status: 201 });
      }),
    );
    const { user } = renderPage();

    await user.type(await screen.findByLabelText('Название пространства'), 'Новый канвас');
    await user.click(screen.getByRole('button', { name: 'Создать пространство' }));

    expect(await screen.findByText('Канвас открыт')).toBeVisible();
  });
});
