'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingState } from '@/components/common/LoadingState';
import { ErrorState } from '@/components/common/ErrorState';
import { createProfile, getProfile } from '@/lib/profile';
import { createClient } from '@/lib/supabase/supabaseClient';

export default function SetupPage() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        router.replace('/login');
        return;
      }

      const profile = await getProfile(user.id);
      // TEMP: guard disabled during UI work, restore before shipping.
      // if (profile) {
      //   router.replace('/');
      //   return;
      // }
      void profile;

      setUserId(user.id);
      setEmail(user.email ?? '');
      setLoading(false);
    };

    loadSession();
  }, [router, supabase.auth]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
      setError('닉네임은 2~10자로 입력해주세요.');
      return;
    }

    if (!userId || !email) {
      setError('다시 로그인 후 시도해주세요.');
      return;
    }

    setSubmitting(true);

    try {
      await createProfile(userId, email, trimmedNickname);
      router.replace('/');
    } catch (createError) {
      if (
        typeof createError === 'object' &&
        createError !== null &&
        'status' in createError &&
        createError.status === 404
      ) {
        setError(
          'profiles 테이블을 찾지 못했습니다. Supabase에 해당 테이블이 생성되었는지 확인해주세요.',
        );
      } else {
        setError('프로필 저장에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-10 text-text-primary">
        <LoadingState message="계정을 준비 중입니다…" />
      </main>
    );
  }

  if (error && error.includes('다시')) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-10 text-text-primary">
        <ErrorState
          title="오류가 발생했습니다"
          description={error}
          actionLabel="로그인으로"
          onRetry={() => router.replace('/login')}
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-white px-6 py-6 text-text-primary">

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <h1 className="text-center text-2xl font-bold">닉네임을 설정해주세요</h1>

        <div className="mt-6 flex justify-center">
          <img
            src="/assets/mascot/sun_09_clap.svg"
            alt="Good Morning mascot"
            className="h-40 w-40"
          />
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            id="nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="닉네임 입력 (2~10자)"
            disabled={submitting}
            autoFocus
          />

          {error ? <p className="text-center text-sm text-danger">{error}</p> : null}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? '저장 중…' : '시작하기'}
          </Button>
        </form>
      </div>
    </main>
  );
}
