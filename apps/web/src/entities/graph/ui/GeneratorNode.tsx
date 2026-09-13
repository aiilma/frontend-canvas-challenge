import { Handle, type NodeProps, Position } from '@xyflow/react';

import { RadioCards } from '@/shared/ui/RadioCards';

import { useGraphStore } from '../model/graph-store-context';
import { type Scenario } from '../model/graph.store';
import { type GeneratorNode as GeneratorNodeType } from '../model/graph.types';
import { NodeFrame } from './NodeFrame';

const scenarioOptions = [
  { value: 'success', title: 'Успех' },
  { value: 'failure', title: 'Отказ' },
];

const isScenario = (value: string): value is Scenario => value === 'success' || value === 'failure';

export const GeneratorNode = ({ id, data, selected }: NodeProps<GeneratorNodeType>) => {
  const scenario = useGraphStore((state) => state.scenarios[id] ?? 'success');
  const setScenario = useGraphStore((state) => state.setScenario);

  return (
    <NodeFrame id={id} title={data.label} selected={selected}>
      <RadioCards
        label="Сценарий"
        options={scenarioOptions}
        value={scenario}
        onChange={(value) => {
          if (isScenario(value)) setScenario(id, value);
        }}
        className="nodrag"
      />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </NodeFrame>
  );
};
