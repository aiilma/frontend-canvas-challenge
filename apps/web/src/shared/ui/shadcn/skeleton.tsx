import { type ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

const Skeleton = ({ className, ...props }: ComponentProps<'div'>) => (
  <div data-slot="skeleton" className={cn('animate-pulse bg-page', className)} {...props} />
);

export { Skeleton };
