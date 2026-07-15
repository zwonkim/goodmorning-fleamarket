'use client';

import * as React from 'react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/supabaseClient';
import { authRedirectUrl } from '@/lib/auth';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const supabase = createClient();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('idle');
    setMessage('');

    if (!email.trim()) {
      setStatus('error');
      setMessage('이메일 주소를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: authRedirectUrl,
      },
    });

    setIsSubmitting(false);

    if (error) {
      setStatus('error');
      setMessage(error.message);
      return;
    }

    setStatus('success');
    setMessage('매직링크를 보냈어요. 메일함을 확인해주세요.');
  };

  return (
    <div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          id="email"
          type="email"
          aria-label="이메일 주소"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="이메일을 입력하세요"
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? '링크 보내는 중…' : '링크 보내기'}
        </Button>
      </form>
      {message ? (
        <p
          className={`mt-4 text-center text-sm ${
            status === 'success' ? 'text-success' : 'text-danger'
          }`}
        >
          {message}
        </p>
      ) : null}
      <p className="mt-4 text-center text-xs text-text-secondary">
        굿모닝 친구들만 로그인할 수 있어요
      </p>
    </div>
  );
}
