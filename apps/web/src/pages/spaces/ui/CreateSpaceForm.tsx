import { type FormEvent, useState } from 'react';

import { type SpaceData } from '@canvas/contracts';

import { InlineError } from '@/shared/ui/InlineError';
import { Button } from '@/shared/ui/shadcn/button';
import { TextField } from '@/shared/ui/TextField';
import { maxTitleLength, titleError, useCreateSpace } from '@/entities/space';

interface CreateSpaceFormProps {
  onCreated: (space: SpaceData) => void;
}

export const CreateSpaceForm = ({ onCreated }: CreateSpaceFormProps) => {
  const [title, setTitle] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { createSpace, isPending, error } = useCreateSpace(onCreated);
  const validation = submitted ? titleError(title) : null;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (titleError(title) === null) createSpace(title.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mb-12 flex max-w-2xl flex-col items-start gap-6 md:flex-row md:items-end"
    >
      <TextField
        label="Название пространства"
        value={title}
        maxLength={maxTitleLength}
        onChange={(event) => setTitle(event.target.value)}
        error={validation ?? undefined}
        className="w-full"
      />
      <div className="flex flex-col gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Создаём…' : 'Создать пространство'}
        </Button>
        {error && <InlineError role="alert">{error.message}</InlineError>}
      </div>
    </form>
  );
};
