'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { createClient } from '@/lib/supabase/supabaseClient';
import type { AuthChangeEvent, User, Session } from '@supabase/supabase-js';

export function AuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) {
        return;
      }
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (!mounted) {
        return;
      }
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return <p className="text-sm text-text-secondary">Checking authentication…</p>;
  }

  if (!user) {
    return (
      <p className="text-sm text-text-secondary">
        You are not signed in yet. <Link href="/login" className="font-semibold text-sky hover:underline">Sign in</Link> to continue.
      </p>
    );
  }

  return (
    <div className="space-y-4 rounded-card border border-border bg-white p-6 shadow-soft">
      <div className="space-y-2">
        <p className="text-sm text-text-secondary">Signed in as</p>
        <p className="text-base font-semibold text-text-primary">{user.email}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={handleSignOut}>
          Sign out
        </Button>
        <Link
          href="/setup"
          className="inline-flex items-center justify-center rounded-button border border-border bg-cream px-4 py-3 text-sm font-semibold text-text-primary transition hover:bg-sky/10"
        >
          Complete profile
        </Link>
      </div>
    </div>
  );
}
