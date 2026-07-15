'use client';

import Link from 'next/link';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/common';
import { deleteProduct, getLikedProducts, getProductsByUser } from '@/lib/products';
import { unlikeProduct } from '@/lib/likes';
import { getProfile } from '@/lib/profile';
import { createClient } from '@/lib/supabase/supabaseClient';
import { cn } from '@/lib/utils';
import { CONDITION_LABELS } from '@/types/product';
import type { ProductSummary } from '@/lib/products';
import type { Profile } from '@/types/profile';

type Tab = 'mine' | 'liked';

export default function MyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<Tab>('mine');
  const [myProducts, setMyProducts] = useState<ProductSummary[]>([]);
  const [likedProducts, setLikedProducts] = useState<ProductSummary[]>([]);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.replace('/login');
        return;
      }

      if (!mounted) {
        return;
      }
      setUserId(user.id);

      const [profileResult, mineResult, likedResult] = await Promise.all([
        getProfile(user.id),
        getProductsByUser(user.id),
        getLikedProducts(user.id),
      ]);

      if (!mounted) {
        return;
      }

      setProfile(profileResult);
      setMyProducts(mineResult);
      setLikedProducts(likedResult);
      setLoading(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('이 상품을 삭제할까요?')) {
      return;
    }

    try {
      await deleteProduct(productId);
      setMyProducts((current) => current.filter((product) => product.id !== productId));
    } catch (error) {
      console.error('Failed to delete product', error);
      window.alert('상품 삭제에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleUnlike = async (productId: string) => {
    if (!userId) {
      return;
    }

    try {
      await unlikeProduct(productId, userId);
      setLikedProducts((current) => current.filter((product) => product.id !== productId));
    } catch (error) {
      console.error('Failed to unlike product', error);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <LoadingState message="마이페이지를 불러오는 중이에요…" />
      </main>
    );
  }

  const activeList = tab === 'mine' ? myProducts : likedProducts;

  return (
    <main className="min-h-screen bg-white px-4 py-6 text-text-primary">
      <header className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/')}
          aria-label="뒤로 가기"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-cream"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold">마이페이지</h1>
      </header>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-cream">
          <img
            src="/assets/mascot/sun_01_base.svg"
            alt="Good Morning mascot"
            className="h-9 w-9"
          />
        </div>
        <p className="text-lg font-bold">{profile?.nickname ?? '친구'}</p>
      </div>

      <div className="mb-5 grid grid-cols-2 rounded-full bg-cream p-1">
        <button
          type="button"
          onClick={() => setTab('mine')}
          className={cn(
            'rounded-full py-2 text-sm font-semibold transition',
            tab === 'mine' ? 'bg-white text-text-primary shadow-soft' : 'text-text-secondary',
          )}
        >
          내 상품
        </button>
        <button
          type="button"
          onClick={() => setTab('liked')}
          className={cn(
            'rounded-full py-2 text-sm font-semibold transition',
            tab === 'liked' ? 'bg-white text-text-primary shadow-soft' : 'text-text-secondary',
          )}
        >
          좋아요한 상품
        </button>
      </div>

      {activeList.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-secondary">
          {tab === 'mine' ? '아직 등록한 상품이 없어요' : '아직 좋아요한 상품이 없어요'}
        </p>
      ) : (
        <ul className="space-y-4">
          {activeList.map((product) => (
            <li key={product.id} className="flex items-center gap-3">
              <Link href={`/products/${product.id}`} className="flex flex-1 items-center gap-3">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-[0.85rem] bg-cream">
                  {product.thumbnailUrl ? (
                    <img
                      src={product.thumbnailUrl}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src="/assets/mascot/sun_01_base.svg"
                      alt="Good Morning mascot"
                      className="h-8 w-8"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{product.title}</p>
                  <p className="text-sm font-bold">{product.price.toLocaleString('ko-KR')}원</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary">
                    <span className="rounded-full border border-border px-2 py-0.5">
                      {CONDITION_LABELS[product.condition]}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-[#ff6b57]">♥</span>
                      {product.likes}
                    </span>
                  </div>
                </div>
              </Link>
              <button
                type="button"
                onClick={() =>
                  tab === 'mine' ? handleDeleteProduct(product.id) : handleUnlike(product.id)
                }
                aria-label={tab === 'mine' ? '상품 삭제' : '찜 해제'}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-text-secondary transition hover:bg-cream"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
