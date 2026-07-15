'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({ className, ...props }: TextAreaProps) {
  return (
    <textarea
      className={cn(
        'min-h-[120px] w-full rounded-input border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-secondary focus:border-sky focus:ring-2 focus:ring-sky/30',
        className
      )}
      {...props}
    />
  );
}
