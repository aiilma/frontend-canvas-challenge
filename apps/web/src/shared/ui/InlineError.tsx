import { type ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';
import { Glyph } from '@/shared/ui/Glyph';

export type Tone = 'default' | 'inverse';

interface InlineErrorProps extends ComponentProps<'span'> {
  tone?: Tone;
}

export const InlineError = ({
  tone = 'default',
  className,
  children,
  ...props
}: InlineErrorProps) => (
  <span
    className={cn(
      'flex items-center gap-1 text-caption',
      tone === 'inverse' ? 'text-white' : 'text-warning',
      className,
    )}
    {...props}
  >
    <Glyph name="arrow" />
    {children}
  </span>
);
