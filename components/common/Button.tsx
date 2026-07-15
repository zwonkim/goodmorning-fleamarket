'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'inline-flex items-center justify-center rounded-button bg-sunny px-4 py-3 text-sm font-semibold text-text-primary shadow-soft transition hover:bg-sunny/90',
  secondary:
    'inline-flex items-center justify-center rounded-button border border-border bg-white px-4 py-3 text-sm font-semibold text-text-primary shadow-soft transition hover:bg-cream',
  ghost:
    'inline-flex items-center justify-center rounded-button px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-cream'
};

export function Button({ className, variant = 'primary', ...props }: ButtonProps) {
  return <button className={cn(variantStyles[variant], className)} {...props} />;
}
