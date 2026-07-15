'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        'w-full rounded-input border border-border bg-white px-4 py-3 text-sm text-text-primary outline-none transition focus:border-sky focus:ring-2 focus:ring-sky/30',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
