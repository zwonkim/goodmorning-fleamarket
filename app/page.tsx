'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/common';
import { getProfile } from '@/lib/profile';
import { getFeaturedProducts } from '@/lib/products';
import { createClient } from '@/lib/supabase/supabaseClient';
import type { FeaturedProduct } from '@/lib/products';
import type { Profile } from '@/types/profile';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    getFeaturedProducts().then((featuredProducts) => {
      if (!mounted) {
        return;
      }
      setProducts(featuredProducts);
      setProductsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadHome = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;

      if (!mounted) {
        return;
      }

      setUser(sessionUser);

      if (sessionUser) {
        const nextProfile = await getProfile(sessionUser.id);
        if (!mounted) {
          return;
        }
        setProfile(nextProfile);
      }

      setLoading(false);
    };

    loadHome();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) {
          return;
        }

      setUser(session?.user ?? null);

      if (session?.user) {
        const nextProfile = await getProfile(session.user.id);
        if (!mounted) {
          return;
        }
        setProfile(nextProfile);
      } else {
        setProfile(null);
      }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const displayName = profile?.nickname ?? user?.email?.split('@')[0] ?? '친구';

  return (
    <main className="min-h-screen bg-white px-4 py-6 pb-28 text-text-primary">
      <header className="mb-5 flex items-start justify-between">
        <div>
          <p className="font-mochiy text-2xl tracking-[-0.03em] text-[#FFD966]">
            Good
            <br />
            Morning
          </p>
          <p className="mt-2 text-xs text-text-secondary">
            {loading
              ? '세션을 확인하는 중이에요'
              : user
                ? `반가워요 ${displayName}님 👋`
                : '굿모닝 친구들만 들어올 수 있는 플리마켓'}
          </p>
        </div>
        <Link
          href="/mypage"
          aria-label="마이페이지"
          className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-white shadow-soft"
        >
          {user ? (
            <Avatar src={profile?.avatar_url} nickname={displayName} size="md" className="h-10 w-10" />
          ) : (
            <UserIcon />
          )}
        </Link>
      </header>

      <section className="mb-6 rounded-[1.5rem] bg-[#dbe9ff] p-4 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-text-secondary">📆 7월 17일 오후 7시</p>
            <p className="mt-1 text-sm font-bold leading-5 text-text-primary">
              인천 연수구 컨벤시아대로 70 힐스테이트<br/> 오피스텔 301동 405호에서 만나요 🤩
            </p>
            {!user ? (
              <Link
                href="/login"
                className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-text-primary shadow-soft"
              >
                로그인하러 가기
              </Link>
            ) : null}
          </div>
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem]">
            <img
              src="/assets/mascot/sun_07_rainbow.svg"
              alt="Good Morning mascot"
              className="h-20 w-20"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold tracking-[-0.03em]">전체 상품</h1>
            <p className="text-xs text-text-secondary">친구들이 업로드한 상품을 확인해보세요</p>
          </div>
        </div>

        {productsLoading ? (
          <p className="py-8 text-center text-xs text-text-secondary">
            상품을 불러오는 중이에요
          </p>
        ) : products.length === 0 ? (
          <p className="py-8 text-center text-xs text-text-secondary">
            아직 등록된 상품이 없어요
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}`} className="space-y-2">
                <article className="space-y-2">
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[1.15rem] bg-[#efe6d6]">
                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <img
                        src="/assets/mascot/sun_06_camera.svg"
                        alt="Good Morning mascot"
                        className="h-16 w-16"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <h2 className="line-clamp-2 text-[0.82rem] font-semibold leading-5">
                      {product.title}
                    </h2>
                    <p className="text-sm font-extrabold">
                      {product.price.toLocaleString('ko-KR')}원
                    </p>
                    <div className="flex items-center gap-2 text-[0.78rem] text-text-secondary">
                      <span className="flex items-center gap-1">
                        <span className="text-[#ff6b57]">♥</span>
                        <span>{product.likes}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>💬</span>
                        <span>{product.comments}</span>
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>

      {!user && !loading ? (
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-button bg-sunny px-4 py-3 text-sm font-semibold text-text-primary shadow-soft transition hover:bg-sunny/90"
          >
            로그인하고 입장하기
          </Link>
        </div>
      ) : null}

      <Link
        href="/products/new"
        aria-label="상품 등록"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-sunny text-2xl font-light shadow-[0_14px_30px_rgba(255,206,71,0.55)]"
      >
        +
      </Link>
    </main>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </svg>
  );
}
