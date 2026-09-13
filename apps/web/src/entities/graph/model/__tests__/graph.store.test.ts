import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { chainGraph, generatorId, promptId, resultId } from '@test/factories/graph';

import { toGraph } from '../to-graph';
import { createGraphStore } from '../graph.store';

const DELAY_MS = 500;

const setup = (halt = false) => {
  const save = vi.fn((_json: string, etag: string) => Promise.resolve(`${etag}+`));
  const readEtag = vi.fn(() => Promise.resolve('"server"'));
  const store = createGraphStore({
    spaceId: 's1',
    graph: toGraph(chainGraph()),
    etag: '"0"',
    delayMs: DELAY_MS,
    save,
    readEtag,
    shouldHalt: () => halt,
  });
  return { store, save, readEtag };
};

const settle = () => vi.advanceTimersByTimeAsync(DELAY_MS);

describe('createGraphStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('перемещение ноды сохраняется после паузы и обновляет ETag', async () => {
    const { store, save } = setup();

    store.getState().onNodesChange([{ type: 'position', id: promptId, position: { x: 10, y: 5 } }]);
    expect(store.getState().save.status).toBe('dirty');
    await settle();

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(expect.stringContaining('"x":10,"y":5'), '"0"');
    expect(store.getState().etag).toBe('"0"+');
    expect(store.getState().save.status).toBe('idle');
  });

  it('выделение и измерение ноды не запускают сохранение', async () => {
    const { store, save } = setup();

    store.getState().onNodesChange([
      { type: 'select', id: promptId, selected: true },
      { type: 'dimensions', id: promptId, dimensions: { width: 240, height: 90 } },
    ]);
    await settle();

    expect(save).not.toHaveBeenCalled();
    expect(store.getState().save.status).toBe('idle');
  });

  it('одинаковый граф повторно не отправляется', async () => {
    const { store, save } = setup();

    store.getState().onNodesChange([{ type: 'position', id: promptId, position: { x: 0, y: 0 } }]);
    await settle();

    expect(save).not.toHaveBeenCalled();
    expect(store.getState().save.status).toBe('idle');
  });

  it('ввод текста меняет только свою ноду и уходит одним сохранением', async () => {
    const { store, save } = setup();
    const before = store.getState().nodes;

    store.getState().setPromptText(promptId, 'Мо');
    store.getState().setPromptText(promptId, 'Море');
    const after = store.getState().nodes;
    await settle();

    expect(after[0]?.data).toEqual({ text: 'Море' });
    expect(after[1]).toBe(before[1]);
    expect(after[2]).toBe(before[2]);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith(expect.stringContaining('"text":"Море"'), '"0"');
  });

  it('удаление ноды убирает её связи и обновляет индексы', async () => {
    const { store, save } = setup();

    store.getState().onNodesChange([{ type: 'remove', id: generatorId }]);
    store.getState().onEdgesChange([
      { type: 'remove', id: `${promptId}->${generatorId}` },
      { type: 'remove', id: `${generatorId}->${resultId}` },
    ]);
    await settle();

    expect(store.getState().nodes.map((node) => node.id)).toEqual([promptId, resultId]);
    expect(store.getState().edges).toEqual([]);
    expect(store.getState().indexes.sourceOfInput.size).toBe(0);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('новая связь получает UUID и попадает в индексы', () => {
    const { store } = setup();
    store.getState().onEdgesChange([{ type: 'remove', id: `${promptId}->${generatorId}` }]);

    store.getState().onConnect({
      source: promptId,
      target: generatorId,
      sourceHandle: null,
      targetHandle: null,
    });

    const edge = store.getState().edges.at(-1);
    expect(edge?.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(store.getState().indexes.sourceOfInput.get(generatorId)).toBe(promptId);
  });

  it('ноды и связи получают русские имена для чтения с экрана', () => {
    const { store } = setup();
    store.getState().addNode('prompt', { x: 0, y: 0 });

    expect(store.getState().nodes.map((node) => node.ariaLabel)).toEqual([
      'Текст 1',
      'Генератор 1',
      'Результат 1',
      'Текст 2',
    ]);
    expect(store.getState().edges[0]?.ariaLabel).toBe('Связь: Текст 1 → Генератор 1');
  });

  it('две выделенные совместимые ноды соединяются без мыши в любом порядке выделения', () => {
    const { store } = setup();
    store.getState().onEdgesChange([{ type: 'remove', id: `${generatorId}->${resultId}` }]);
    store.getState().onNodesChange([
      { type: 'select', id: resultId, selected: true },
      { type: 'select', id: generatorId, selected: true },
    ]);

    store.getState().connectSelected();

    const edge = store.getState().edges.at(-1);
    expect(edge).toMatchObject({ source: generatorId, target: resultId });
    expect(edge?.ariaLabel).toBe('Связь: Генератор 1 → Результат 1');
  });

  it('несовместимое или неполное выделение не создаёт связь', () => {
    const { store } = setup();
    const before = store.getState().edges.length;
    store.getState().onNodesChange([
      { type: 'select', id: promptId, selected: true },
      { type: 'select', id: resultId, selected: true },
    ]);

    store.getState().connectSelected();
    store.getState().onNodesChange([{ type: 'select', id: resultId, selected: false }]);
    store.getState().connectSelected();

    expect(store.getState().edges).toHaveLength(before);
  });

  it('добавление ноды сверх лимита игнорируется', () => {
    const { store } = setup();
    for (let i = 0; i < 30; i += 1) store.getState().addNode('prompt', { x: i, y: 0 });

    expect(store.getState().nodes).toHaveLength(20);
  });

  it('конец движения канваса сохраняет viewport', async () => {
    const { store, save } = setup();

    store.getState().setViewport({ x: 100, y: 50, zoom: 2 });
    await settle();

    expect(save).toHaveBeenCalledWith(
      expect.stringContaining('"viewport":{"x":100,"y":50,"zoom":2}'),
      '"0"',
    );
  });

  it('flush без правок отдаёт текущий ETag без запроса', async () => {
    const { store, save } = setup();

    await expect(store.getState().flush()).resolves.toBe('"0"');
    expect(save).not.toHaveBeenCalled();
  });

  it('flush отправляет несохранённое сразу и отдаёт новый ETag', async () => {
    const { store, save } = setup();

    store.getState().setPromptText(promptId, 'Море');

    await expect(store.getState().flush()).resolves.toBe('"0"+');
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('конфликт останавливает сохранение, запись своей версии берёт свежий ETag', async () => {
    const { store, save, readEtag } = setup(true);
    save.mockRejectedValueOnce(new Error('412'));

    store.getState().setPromptText(promptId, 'Море');
    await settle();
    expect(store.getState().save.status).toBe('halted');
    store.getState().setPromptText(promptId, 'Море и горы');
    await settle();
    expect(save).toHaveBeenCalledTimes(1);

    await expect(store.getState().overwriteServer()).resolves.toBe('"server"+');
    expect(readEtag).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenLastCalledWith(expect.stringContaining('Море и горы'), '"server"');
    expect(store.getState().save.status).toBe('idle');
  });
});
