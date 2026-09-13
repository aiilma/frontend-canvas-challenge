import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': ['text-caption', 'text-body', 'text-section', 'text-title', 'text-display'],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
