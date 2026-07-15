'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/supabaseClient';
import { getProfile } from '@/lib/profile';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export function LoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('idle');
    setMessage('');

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setStatus('error');
      setMessage('이메일을 입력해주세요.');
      return;
    }

    if (!password) {
      setStatus('error');
      setMessage('비밀번호를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    setIsSubmitting(false);

    if (error || !data.user) {
      setStatus('error');
      setMessage(error?.message ?? '이메일 또는 비밀번호가 올바르지 않아요.');
      return;
    }

    const profile = await getProfile(data.user.id);
    router.replace(profile ? '/' : '/setup');
  };

  return (
    <div>
      <form className="space-y-3" onSubmit={handleLogin}>
        <Input
          id="email"
          type="email"
          aria-label="이메일"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="이메일을 입력하세요"
          autoCapitalize="none"
          autoCorrect="off"
        />
        <Input
          id="password"
          type="password"
          aria-label="비밀번호"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호를 입력하세요"
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? '로그인하는 중…' : '로그인'}
        </Button>
      </form>
      {message ? (
        <p className="mt-4 text-center text-sm text-danger">{message}</p>
      ) : null}
      <p className="mt-4 text-center text-xs text-text-secondary">
        굿모닝 친구들만 로그인할 수 있어요
      </p>
    </div>
  );
}
