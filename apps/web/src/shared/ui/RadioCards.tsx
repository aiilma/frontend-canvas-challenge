import { useId } from 'react';

import { cn } from '@/shared/lib/cn';
import { InlineError, type Tone } from '@/shared/ui/InlineError';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/shadcn/radio-group';

export interface RadioCardOption {
  value: string;
  title: string;
  description?: string;
}

interface RadioCardsProps {
  label: string;
  options: RadioCardOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  tone?: Tone;
  compact?: boolean;
  className?: string;
}

const toneClasses = {
  default: {
    label: 'text-muted',
    item: '',
    description: 'text-muted',
  },
  inverse: {
    label: 'text-white',
    item: 'border-white/60 text-white hover:border-white focus-visible:outline-white data-[state=checked]:border-white',
    description: 'text-white',
  },
} satisfies Record<Tone, Record<'label' | 'item' | 'description', string>>;

export const RadioCards = ({
  label,
  options,
  value,
  onChange,
  error,
  tone = 'default',
  compact = false,
  className,
}: RadioCardsProps) => {
  const id = useId();
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  const classes = toneClasses[tone];

  return (
    <div className={className}>
      <span id={labelId} className={cn('mb-2 block text-caption', classes.label)}>
        {label}
      </span>
      <RadioGroup
        aria-labelledby={labelId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        value={value}
        onValueChange={onChange}
        className={cn(compact && 'grid-flow-col gap-2')}
      >
        {options.map((option) => (
          <RadioGroupItem
            key={option.value}
            value={option.value}
            className={cn(classes.item, compact && 'min-h-8 px-3 py-1')}
          >
            <span className="flex flex-col">
              <span>{option.title}</span>
              {option.description !== undefined && (
                <span className={cn('text-caption', classes.description)}>
                  {option.description}
                </span>
              )}
            </span>
          </RadioGroupItem>
        ))}
      </RadioGroup>
      {error !== undefined && (
        <InlineError id={errorId} tone={tone} className="mt-2">
          {error}
        </InlineError>
      )}
    </div>
  );
};
