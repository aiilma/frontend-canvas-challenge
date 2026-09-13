import { type VariantProps } from 'class-variance-authority';
import { Link, type LinkProps } from 'react-router';

import { cn } from '@/shared/lib/cn';
import { Glyph } from '@/shared/ui/Glyph';
import { buttonVariants } from '@/shared/ui/shadcn/button';

interface ButtonLinkProps extends LinkProps, VariantProps<typeof buttonVariants> {
  glyph?: 'plus' | 'arrow';
}

export const ButtonLink = ({
  variant,
  tone,
  glyph,
  className,
  children,
  ...props
}: ButtonLinkProps) => (
  <Link className={cn(buttonVariants({ variant, tone }), className)} {...props}>
    {glyph && <Glyph name={glyph} />}
    {children}
  </Link>
);
