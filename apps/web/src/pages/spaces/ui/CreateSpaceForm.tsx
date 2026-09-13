import { type FormEvent, useId, useState } from 'react';

import { type SpaceData } from '@canvas/contracts';

import { InlineError } from '@/shared/ui/InlineError';
import { Button } from '@/shared/ui/shadcn/button';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { maxTitleLength, titleError, useCreateSpace } from '@/entities/space';

interface CreateSpaceFormProps {
  onCreated: (space: SpaceData) => void;
}

export const CreateSpaceForm = ({ onCreated }: CreateSpaceFormProps) => {
  const [title, setTitle] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { createSpace, isPending, error } = useCreateSpace(onCreated);
  const fieldId = useId();
  const messageId = `${fieldId}-message`;
  const validation = submitted ? titleError(title) : null;
  const message = validation ?? error?.message ?? null;
  const isInvalid = validation !== null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (titleError(title) === null) createSpace(title.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mb-12 grid max-w-2xl gap-x-6 gap-y-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={fieldId}>Название пространства</Label>
        <Input
          id={fieldId}
          value={title}
          maxLength={maxTitleLength}
          aria-invalid={isInvalid || undefined}
          aria-describedby={message === null ? undefined : messageId}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={isPending} className="mt-4 md:mt-0">
        {isPending ? 'Создаём…' : 'Создать пространство'}
      </Button>
      {message !== null && (
        <InlineError id={messageId} role={error ? 'alert' : undefined} className="md:col-span-full">
          {message}
        </InlineError>
      )}
    </form>
  );
};
