'use client';

import { Spinner } from '@/components/common/Spinner';

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <Spinner />
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  );
}
