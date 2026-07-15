'use client';

import { Button } from '@/components/common/Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 text-center">
      <img
        src="/assets/mascot/sun_10_package.svg"
        alt="Good Morning mascot"
        className="h-32 w-32"
      />
      <div>
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        <p className="mt-2 text-sm text-text-secondary">{description}</p>
      </div>
      {actionLabel && onAction ? (
        <Button onClick={onAction} className="w-full">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
