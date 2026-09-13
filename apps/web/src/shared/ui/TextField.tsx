import { type ComponentProps, useId } from 'react';

import { cn } from '@/shared/lib/cn';
import { InlineError } from '@/shared/ui/InlineError';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';

interface TextFieldProps extends ComponentProps<'input'> {
  label: string;
  error?: string;
}

export const TextField = ({ label, error, className, ...props }: TextFieldProps) => {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && <InlineError id={errorId}>{error}</InlineError>}
    </div>
  );
};
