import { useState } from 'react';
import { Handle, type NodeProps, Position } from '@xyflow/react';

import { InlineError } from '@/shared/ui/InlineError';
import { RadioCards } from '@/shared/ui/RadioCards';
import { Button } from '@/shared/ui/shadcn/button';
import {
  completeChain,
  type GeneratorNode as GeneratorNodeType,
  type Scenario,
  useGraphStore,
} from '@/entities/graph';
import { useGenerations, useStartGeneration } from '@/entities/generation';

import { NodeFrame } from './NodeFrame';

const scenarioOptions = [
  { value: 'success', title: 'Успех' },
  { value: 'failure', title: 'Отказ' },
];

const incompleteChainHint = 'Соедините непустой текст, генератор и результат';

const isScenario = (value: string): value is Scenario => value === 'success' || value === 'failure';

export const GeneratorNode = ({ id, data, selected }: NodeProps<GeneratorNodeType>) => {
  const spaceId = useGraphStore((state) => state.spaceId);
  const scenario = useGraphStore((state) => state.scenarios[id] ?? 'success');
  const setScenario = useGraphStore((state) => state.setScenario);
  const isChainComplete = useGraphStore((state) => completeChain(id, state.indexes) !== null);
  const flush = useGraphStore((state) => state.flush);
  const saveStatus = useGraphStore((state) => state.save.status);
  const { index } = useGenerations(spaceId);
  const { start, isPending, error, reset } = useStartGeneration(spaceId);
  const current = index?.byGenerator.get(id);
  const isProcessing = current?.status === 'processing';
  const isFailed = current?.status === 'failed';
  const [attempted, setAttempted] = useState(false);
  const showIncomplete = attempted && !isChainComplete;

  const handleGenerate = () => {
    reset();
    setAttempted(true);
    if (!isChainComplete) return;
    void flush()
      .then((graphETag) => start({ nodeId: id, graphETag, scenario }))
      .catch(() => undefined);
  };

  const label = isPending
    ? 'Запускаем…'
    : isProcessing
      ? 'Генерируем…'
      : isFailed
        ? 'Повторить'
        : 'Сгенерировать';

  return (
    <NodeFrame id={id} title={data.label} selected={selected} failed={isFailed}>
      {isProcessing && (
        <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden" aria-hidden="true">
          <div className="h-full w-1/3 animate-progress bg-accent motion-reduce:w-full motion-reduce:animate-none" />
        </div>
      )}
      <RadioCards
        label="Сценарий"
        options={scenarioOptions}
        value={scenario}
        onChange={(value) => {
          if (isScenario(value)) setScenario(id, value);
        }}
        className="nodrag"
      />
      <div className="flex flex-col gap-2">
        <Button
          variant="brand"
          className="nodrag w-full"
          disabled={isPending || isProcessing || saveStatus === 'saving'}
          onClick={handleGenerate}
        >
          {label}
        </Button>
        {isFailed && !error && <InlineError>Отказ генерации</InlineError>}
        {error && <InlineError role="alert">{error.message}</InlineError>}
        {showIncomplete && <InlineError role="alert">{incompleteChainHint}</InlineError>}
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </NodeFrame>
  );
};
