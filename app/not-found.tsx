'use client';

import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/common/ErrorState';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-10 text-text-primary">
      <ErrorState
        title="페이지를 찾을 수 없어요"
        description="요청하신 경로가 존재하지 않거나 이동된 것 같아요."
        actionLabel="홈으로"
        onRetry={() => router.replace('/')}
      />
    </main>
  );
}
