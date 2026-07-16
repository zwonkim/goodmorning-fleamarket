'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-input border border-border bg-white px-4 py-3 text-base text-text-primary outline-none transition placeholder:text-text-secondary focus:border-sky focus:ring-2 focus:ring-sky/30',
        className
      )}
      {...props}
    />
  );
}
