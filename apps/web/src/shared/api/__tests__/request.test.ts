import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { api, errorResponse, jsonResponse, requestId } from '@test/mocks/api';
import { server } from '@test/mocks/server';

import { ApiError } from '../error';
import { request, requestWithMeta } from '../request';

const failure = (promise: Promise<unknown>) => promise.catch((caught: unknown) => caught);

const graphPath = '/api/spaces/s1/graph';
const etag = '"abc"';

describe('request', () => {
  it('отдаёт тело ответа как есть, без обёртки', async () => {
    server.use(http.get(api('/api/spaces'), () => jsonResponse([{ id: 's1' }])));

    await expect(request({ method: 'GET', path: '/api/spaces' })).resolves.toEqual([{ id: 's1' }]);
  });

  it('ответ 204 без тела отдаёт undefined', async () => {
    server.use(http.get(api('/api/spaces'), () => new HttpResponse(null, { status: 204 })));

    await expect(request({ method: 'GET', path: '/api/spaces' })).resolves.toBeUndefined();
  });

  it('ETag и Location приходят вместе с телом', async () => {
    server.use(
      http.get(api(graphPath), () =>
        jsonResponse({ nodes: [] }, { headers: { ETag: etag, Location: '/api/spaces/s1' } }),
      ),
    );

    await expect(requestWithMeta({ method: 'GET', path: graphPath })).resolves.toEqual({
      data: { nodes: [] },
      etag,
      location: '/api/spaces/s1',
    });
  });

  it('без заголовков ETag и Location отдаётся null', async () => {
    server.use(http.get(api('/api/spaces'), () => jsonResponse([])));

    await expect(requestWithMeta({ method: 'GET', path: '/api/spaces' })).resolves.toEqual({
      data: [],
      etag: null,
      location: null,
    });
  });

  it('If-Match и Idempotency-Key уходят заголовками, JSON-строка тела уходит байт в байт', async () => {
    const body = '{"nodes":[],"edges":[],"viewport":{"x":0,"y":0,"zoom":1}}';
    server.use(
      http.put(api(graphPath), async ({ request: incoming }) =>
        jsonResponse({
          ifMatch: incoming.headers.get('If-Match'),
          key: incoming.headers.get('Idempotency-Key'),
          contentType: incoming.headers.get('Content-Type'),
          raw: await incoming.text(),
        }),
      ),
    );

    await expect(
      request({ method: 'PUT', path: graphPath, body, ifMatch: etag, idempotencyKey: 'key-123' }),
    ).resolves.toEqual({
      ifMatch: etag,
      key: 'key-123',
      contentType: 'application/json',
      raw: body,
    });
  });

  it('объект тела сериализуется в JSON, необязательные заголовки не отправляются', async () => {
    server.use(
      http.post(api('/api/spaces'), async ({ request: incoming }) =>
        jsonResponse(
          {
            body: await incoming.json(),
            hasIfMatch: incoming.headers.has('If-Match'),
            hasKey: incoming.headers.has('Idempotency-Key'),
          },
          { status: 201 },
        ),
      ),
    );

    await expect(
      request({ method: 'POST', path: '/api/spaces', body: { title: 'Мой канвас' } }),
    ).resolves.toEqual({ body: { title: 'Мой канвас' }, hasIfMatch: false, hasKey: false });
  });

  describe('ошибки приводятся к ApiError', () => {
    it('не-JSON тело успешного ответа это ошибка разбора', async () => {
      server.use(http.get(api('/api/spaces'), () => HttpResponse.text('<html></html>')));

      const error = await failure(request({ method: 'GET', path: '/api/spaces' }));

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ kind: 'parse', status: 200, isRetryable: false });
    });

    it('обрыв сети это сетевая ошибка, которую можно повторить', async () => {
      server.use(http.get(api('/api/spaces'), () => HttpResponse.error()));

      const error = await failure(request({ method: 'GET', path: '/api/spaces' }));

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ kind: 'network', status: null, isRetryable: true });
    });

    it('ошибка API отдаёт код, статус, сообщение и requestId сервера', async () => {
      server.use(
        http.put(api(graphPath), () =>
          errorResponse(412, 'GRAPH_VERSION_CONFLICT', 'Граф изменился.'),
        ),
      );

      const error = await failure(request({ method: 'PUT', path: graphPath, body: '{}' }));

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        kind: 'http',
        status: 412,
        code: 'GRAPH_VERSION_CONFLICT',
        message: 'Граф изменился.',
        requestId,
        isRetryable: false,
      });
    });

    it('ошибка без тела по контракту это ошибка разбора со статусом', async () => {
      server.use(http.get(api('/api/spaces'), () => HttpResponse.text('gateway', { status: 502 })));

      const error = await failure(request({ method: 'GET', path: '/api/spaces' }));

      expect(error).toMatchObject({ kind: 'parse', status: 502 });
    });
  });
});
