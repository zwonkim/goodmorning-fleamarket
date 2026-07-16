'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Avatar, Skeleton } from '@/components/common';
import { getProfile } from '@/lib/profile';
import { getFeaturedProducts } from '@/lib/products';
import { REVIEWS } from '@/lib/reviews';
import { createClient } from '@/lib/supabase/supabaseClient';
import { cn } from '@/lib/utils';
import { STATUS_BADGE_CLASSES, STATUS_LABELS } from '@/types/product';
import type { FeaturedProduct } from '@/lib/products';
import type { Profile } from '@/types/profile';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

const POPULAR_MIN_SCORE = 3;
const POPULAR_LIMIT = 6;

function couponGiftSeenKey(userId: string) {
  return `coupon-gift-seen:${userId}`;
}

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showCouponGift, setShowCouponGift] = useState(false);
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

  useEffect(() => {
    if (!user) {
      return;
    }

    const seen = window.localStorage.getItem(couponGiftSeenKey(user.id));
    if (!seen) {
      setShowCouponGift(true);
    }
  }, [user]);

  const dismissCouponGift = () => {
    if (user) {
      window.localStorage.setItem(couponGiftSeenKey(user.id), '1');
    }
    setShowCouponGift(false);
  };

  const goToCouponBox = () => {
    dismissCouponGift();
    router.push('/mypage?tab=coupons');
  };

  const displayName = profile?.nickname ?? user?.email?.split('@')[0] ?? '친구';

  const popularProducts = useMemo(() => {
    return products
      .filter((product) => product.likes + product.comments >= POPULAR_MIN_SCORE)
      .sort((a, b) => b.likes + b.comments - (a.likes + a.comments))
      .slice(0, POPULAR_LIMIT);
  }, [products]);

  return (
    <main className="min-h-screen bg-white px-4 py-6 pb-28 text-text-primary">
      <header className="sticky top-0 z-20 mb-5 flex items-start justify-between bg-white pb-4 pt-6 -mt-6">
        <div>
          <p className="font-mochiy text-2xl tracking-[-0.03em] text-[#FFD966]">
            Good Morning
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            {loading ? (
              '세션을 확인하는 중이에요'
            ) : user ? (
              <>
                반가워요 <span className="font-bold text-text-primary">{displayName}</span>님 👋
              </>
            ) : (
              '굿모닝 친구들만 들어올 수 있는 플리마켓'
            )}
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

      {popularProducts.length > 0 ? (
        <section className="mb-6">
          <div className="mb-4">
            <h1 className="text-lg font-extrabold tracking-[-0.03em]">🔥 인기 상품</h1>
            <p className="text-xs text-text-secondary">좋아요와 댓글이 많은 상품이에요</p>
          </div>

          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-1">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} className="w-36 shrink-0" />
            ))}
          </div>
        </section>
      ) : null}

      {REVIEWS.length > 0 ? (
        <section className="mb-6">
          <div className="mb-4">
            <h1 className="text-lg font-extrabold tracking-[-0.03em]">💌 거래 후기</h1>
            <p className="text-xs text-text-secondary">친구로부터 도착한 생생한 거래 후기예요</p>
          </div>

          <Link
            href={`/reviews/${REVIEWS[0].id}`}
            className="flex gap-3 rounded-[1.15rem] border border-border p-3 shadow-soft"
          >
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[0.85rem] bg-cream">
              <img
                src={REVIEWS[0].images[0]}
                alt={REVIEWS[0].title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-1 text-sm font-bold">{REVIEWS[0].title}</h2>
              <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{REVIEWS[0].content}</p>
              <span className="mt-2 inline-flex items-center gap-0.5 text-xs font-semibold text-text-secondary">
                더보기
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        </section>
      ) : null}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold tracking-[-0.03em]">🛍️ 전체 상품</h1>
            <p className="text-xs text-text-secondary">친구들이 업로드한 상품을 확인해보세요</p>
          </div>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-[1.15rem]" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="py-8 text-center text-xs text-text-secondary">
            아직 등록된 상품이 없어요
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
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

      {showCouponGift ? (
        <CouponGiftModal onDismiss={dismissCouponGift} onOpenCoupons={goToCouponBox} />
      ) : null}
    </main>
  );
}

function CouponGiftModal({
  onDismiss,
  onOpenCoupons,
}: {
  onDismiss: () => void;
  onOpenCoupons: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/40 px-6">
      <div className="w-full max-w-[320px] overflow-hidden rounded-2xl bg-white shadow-soft">
        <div className="bg-gradient-to-r from-[#ff8da1] to-[#e0457f] py-3.5 text-center text-[0.95rem] font-bold text-white">
          특별 쿠폰 지급 안내
        </div>
        <button type="button" onClick={onOpenCoupons} className="block w-full px-6 pb-6 pt-6 text-left">
          <p className="text-[1.55rem] font-extrabold leading-[1.35] text-text-primary">
            축하합니다!
            <br />
            <span className="text-[#e0457f]">쿠폰팩</span>을
            <br />
            선물해 드렸어요.
          </p>
          <p className="mt-3 text-sm font-bold text-text-secondary">지금 쿠폰함을 확인해 보세요.</p>
          <div className="mt-5 ml-auto flex w-fit flex-col items-center gap-1">
            <img
              src="/assets/mascot/sun_10_package.svg"
              alt="Good Morning mascot"
              className="h-24 w-24"
            />
            <p className="text-xs text-text-secondary">햇님 이미지를 누르세요</p>
          </div>
        </button>
      </div>
      <button type="button" onClick={onDismiss} className="text-sm font-medium text-white/90">
        오늘은 그만 보기
      </button>
    </div>
  );
}

function ProductCard({
  product,
  className,
}: {
  product: FeaturedProduct;
  className?: string;
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      className={className ? `space-y-2 ${className}` : 'space-y-2'}
    >
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
          <div className="flex items-center gap-1.5">
            {product.status !== 'for_sale' ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[0.65rem] font-semibold',
                  STATUS_BADGE_CLASSES[product.status],
                )}
              >
                {STATUS_LABELS[product.status]}
              </span>
            ) : null}
            <p className="text-sm font-extrabold">{product.price.toLocaleString('ko-KR')}원</p>
          </div>
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
