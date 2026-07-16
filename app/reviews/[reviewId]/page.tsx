'use client';

import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ErrorState } from '@/components/common';
import { getReview } from '@/lib/reviews';
import { cn, formatRelativeDate } from '@/lib/utils';

export default function ReviewDetailPage() {
  const params = useParams<{ reviewId: string }>();
  const router = useRouter();
  const review = getReview(params.reviewId);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleCarouselScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (target.clientWidth === 0) {
      return;
    }
    const index = Math.round(target.scrollLeft / target.clientWidth);
    setActiveImageIndex(index);
  };

  if (!review) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-10 text-text-primary">
        <ErrorState
          title="후기를 찾을 수 없어요"
          description="삭제되었거나 존재하지 않는 후기예요."
          actionLabel="홈으로"
          onRetry={() => router.replace('/')}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-text-primary">
      <header className="flex items-center gap-1 px-3 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-cream"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <p className="text-md font-bold">거래 후기</p>
      </header>

      <div className="relative">
        <div
          onScroll={handleCarouselScroll}
          className="flex aspect-square w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
        >
          {review.images.map((url, index) => (
            <img
              key={url}
              src={url}
              alt={`${review.title} 이미지 ${index + 1}`}
              className="h-full w-full flex-shrink-0 snap-center object-cover"
            />
          ))}
        </div>

        {review.images.length > 1 ? (
          <>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {review.images.map((url, index) => (
                <span
                  key={url}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    index === activeImageIndex ? 'bg-white' : 'bg-white/50',
                  )}
                />
              ))}
            </div>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
              {activeImageIndex + 1}/{review.images.length}
            </div>
          </>
        ) : null}
      </div>

      <div className="space-y-5 px-5 py-5 pb-10">
        <div>
          <h1 className="text-lg font-bold">{review.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
            <span>
              {review.sellerNickname} → {review.buyerNickname}
            </span>
            <span>·</span>
            <span>{formatRelativeDate(review.createdAt)}</span>
          </div>
        </div>

        <p className="whitespace-pre-line text-base leading-7 text-text-secondary">
          {review.content}
        </p>
      </div>
    </main>
  );
}
