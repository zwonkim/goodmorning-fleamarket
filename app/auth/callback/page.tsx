'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { getProfile } from '@/lib/profile';
import { createClient } from '@/lib/supabase/supabaseClient';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [message, setMessage] = useState('Finishing sign in...');
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      const session = data.session;

      if (error || !session?.user) {
        setStatus('error');
        setMessage(error?.message ?? 'Unable to complete sign-in.');
        return;
      }

      const profile = await getProfile(session.user.id);
      router.replace(profile ? '/' : '/setup');
    };

    handleCallback();
  }, [router, supabase.auth]);

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-10 text-text-primary">
        <LoadingState message="Finalizing sign in..." />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-10 text-text-primary">
      <ErrorState
        title="Sign in failed"
        description={message}
        actionLabel="Back to login"
        onRetry={() => router.replace('/login')}
      />
    </main>
  );
}
