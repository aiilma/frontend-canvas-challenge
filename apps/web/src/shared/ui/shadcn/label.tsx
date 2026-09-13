import { Label as LabelPrimitive } from 'radix-ui';
import { type ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

const Label = ({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) => (
  <LabelPrimitive.Root
    data-slot="label"
    className={cn(
      'flex items-center gap-2 text-caption text-muted select-none peer-disabled:opacity-50',
      className,
    )}
    {...props}
  />
);

export { Label };
