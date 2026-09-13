import { type ComponentProps } from 'react';

import { cn } from '@/shared/lib/cn';

const paths = {
  plus: 'M8 3v10M3 8h10',
  minus: 'M3 8h10',
  arrow: 'M4 2v8h9M10 7l3 3-3 3',
};

interface GlyphProps extends ComponentProps<'svg'> {
  name: keyof typeof paths;
}

export const Glyph = ({ name, className, ...props }: GlyphProps) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn('shrink-0', className)}
    {...props}
  >
    <path d={paths[name]} />
  </svg>
);
