import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { type ComponentProps } from 'react';

import { hoverUnderline } from '@/shared/lib/classes';
import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'h-11 bg-ink px-5 font-medium text-white hover:bg-ink/90',
        brand: 'h-11 bg-accent-deep px-5 font-medium text-white hover:bg-accent-deep/90',
        text: cn('min-h-6 gap-1 text-ink', hoverUnderline),
      },
      tone: {
        default: '',
        inverse: '',
      },
    },
    compoundVariants: [
      { variant: 'brand', tone: 'inverse', class: 'bg-white text-ink hover:bg-white/90' },
      { variant: 'text', tone: 'inverse', class: 'text-white' },
    ],
    defaultVariants: {
      variant: 'primary',
      tone: 'default',
    },
  },
);

interface ButtonProps extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = ({
  className,
  variant = 'primary',
  tone = 'default',
  asChild = false,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      className={cn(buttonVariants({ variant, tone, className }))}
      {...props}
    />
  );
};

export { Button, buttonVariants };
