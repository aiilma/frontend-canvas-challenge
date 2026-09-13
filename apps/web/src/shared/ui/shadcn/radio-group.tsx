import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import { type ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';
import { Glyph } from '@/shared/ui/Glyph';

const RadioGroup = ({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Root>) => (
  <RadioGroupPrimitive.Root
    data-slot="radio-group"
    className={cn('grid gap-3', className)}
    {...props}
  />
);

const RadioGroupItem = ({
  className,
  children,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item>) => (
  <RadioGroupPrimitive.Item
    data-slot="radio-group-item"
    className={cn(
      'flex min-h-11 w-full cursor-pointer items-center gap-2 border border-hairline px-4 py-3 text-start text-body text-ink transition-colors hover:border-ink disabled:cursor-default disabled:opacity-50 aria-invalid:border-warning data-[state=checked]:border-ink',
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator
      data-slot="radio-group-indicator"
      forceMount
      className="data-[state=unchecked]:invisible"
    >
      <Glyph name="arrow" />
    </RadioGroupPrimitive.Indicator>
    {children}
  </RadioGroupPrimitive.Item>
);

export { RadioGroup, RadioGroupItem };
