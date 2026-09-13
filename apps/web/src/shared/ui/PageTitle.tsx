import { type ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

export const PageTitle = ({ className, ...props }: ComponentProps<'h1'>) => (
  <h1 className={cn('mb-12 text-title', className)} {...props} />
);
