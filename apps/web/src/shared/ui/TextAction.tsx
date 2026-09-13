import { type ComponentProps } from 'react';

import { Glyph } from '@/shared/ui/Glyph';
import { type Tone } from '@/shared/ui/InlineError';
import { Button } from '@/shared/ui/shadcn/button';

interface TextActionProps extends ComponentProps<'button'> {
  glyph: 'plus' | 'minus' | 'arrow';
  tone?: Tone;
}

export const TextAction = ({
  glyph,
  tone = 'default',
  children,
  type = 'button',
  ...props
}: TextActionProps) => (
  <Button variant="text" tone={tone} type={type} {...props}>
    <Glyph name={glyph} />
    {children}
  </Button>
);
