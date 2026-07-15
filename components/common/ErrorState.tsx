'use client';

import { Button } from '@/components/common/Button';

interface ErrorStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onRetry?: () => void;
}

export function ErrorState({ title, description, actionLabel, onRetry }: ErrorStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 text-center">
      <img
        src="/assets/mascot/sun_08_magnifier.svg"
        alt="Good Morning mascot"
        className="h-32 w-32"
      />
      <div>
        <h2 className="text-lg font-bold text-text-primary">{title}</h2>
        <p className="mt-2 text-sm text-text-secondary">{description}</p>
      </div>
      {actionLabel && onRetry ? (
        <Button onClick={onRetry} className="w-full">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
