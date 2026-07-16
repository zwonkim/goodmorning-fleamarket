'use client';

import { ArrowLeft, Heart, Pencil, Share2, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, Button, CommentItem, EmptyState, ErrorState, LoadingState, TextArea } from '@/components/common';
import { createComment, deleteComment, getComments } from '@/lib/comments';
import { getLikeState, likeProduct, unlikeProduct } from '@/lib/likes';
import { deleteProduct, getProductDetail, getProductImageUrl } from '@/lib/products';
import { getProfile } from '@/lib/profile';
import { createClient } from '@/lib/supabase/supabaseClient';
import { cn, formatRelativeDate } from '@/lib/utils';
import { CONDITION_LABELS } from '@/types/product';
import type { CommentWithAuthor } from '@/lib/comments';
import type { LikeState } from '@/lib/likes';
import type { Product, ProductImage } from '@/types/product';
import type { Profile } from '@/types/profile';

export default function ProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const productId = params.productId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [likeState, setLikeState] = useState<LikeState>({ count: 0, likedByUser: false });
  const [likePending, setLikePending] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [shareFeedback, setShareFeedback] = useState('');
  const [deletingProduct, setDeletingProduct] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSubmitError, setCommentSubmitError] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [commentDeleteError, setCommentDeleteError] = useState(false);

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const load = async () => {
      setLoading(true);
      setNotFound(false);

      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user.id ?? null;

      if (!mounted) {
        return;
      }
      setUserId(currentUserId);

      const detail = await getProductDetail(productId);

      if (!mounted) {
        return;
      }

      if (!detail) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProduct(detail.product);
      setImages(detail.images);

      const [sellerProfile, likeStateResult, currentProfile] = await Promise.all([
        getProfile(detail.product.user_id),
        getLikeState(productId, currentUserId),
        currentUserId ? getProfile(currentUserId) : Promise.resolve(null),
      ]);

      if (!mounted) {
        return;
      }

      setSeller(sellerProfile);
      setLikeState(likeStateResult);
      setProfile(currentProfile);
      setLoading(false);
    };

    load();

    return () => {
      mounted = false;
    };
  }, [productId]);

  useEffect(() => {
    let mounted = true;

    const loadComments = async () => {
      setCommentsLoading(true);
      const result = await getComments(productId);

      if (!mounted) {
        return;
      }

      setComments(result);
      setCommentsLoading(false);
    };

    loadComments();

    return () => {
      mounted = false;
    };
  }, [productId]);

  const handleToggleLike = async () => {
    if (!userId) {
      router.push('/login');
      return;
    }
    if (likePending) {
      return;
    }

    const wasLiked = likeState.likedByUser;
    setLikePending(true);
    setLikeState((current) => ({
      count: wasLiked ? current.count - 1 : current.count + 1,
      likedByUser: !wasLiked,
    }));

    try {
      if (wasLiked) {
        await unlikeProduct(productId, userId);
      } else {
        await likeProduct(productId, userId);
      }
    } catch (error) {
      console.error('Failed to toggle like', error);
      setLikeState((current) => ({
        count: wasLiked ? current.count + 1 : current.count - 1,
        likedByUser: wasLiked,
      }));
    } finally {
      setLikePending(false);
    }
  };

  const submitComment = async (content: string) => {
    if (!userId || !content || commentSubmitting) {
      return;
    }

    setCommentSubmitting(true);
    setCommentSubmitError(false);

    try {
      const created = await createComment(productId, userId, content);
      setComments((current) => [
        ...current,
        {
          ...created,
          author: profile
            ? { id: profile.id, nickname: profile.nickname, avatar_url: profile.avatar_url ?? null }
            : null,
        },
      ]);
      setCommentContent('');
    } catch (error) {
      console.error('Failed to create comment', error);
      setCommentSubmitError(true);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleSubmitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userId) {
      router.push('/login');
      return;
    }

    submitComment(commentContent.trim());
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!userId || deletingCommentId) {
      return;
    }

    setDeletingCommentId(commentId);
    setCommentDeleteError(false);

    try {
      await deleteComment(commentId, userId);
      setComments((current) => current.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment', error);
      setCommentDeleteError(true);
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleReplyToComment = (nickname: string) => {
    if (!userId) {
      router.push('/login');
      return;
    }

    setCommentContent((current) => `@${nickname} ${current}`);
    commentInputRef.current?.focus();
  };

  useEffect(() => {
    const textarea = commentInputRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [commentContent]);

  const handleShare = async () => {
    const shareData = {
      title: product?.title ?? 'Good Morning',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Failed to share product', error);
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.url);
      setShareFeedback('링크를 복사했어요');
    } catch (error) {
      console.error('Failed to copy link', error);
      setShareFeedback('링크 복사에 실패했어요');
    }

    setTimeout(() => setShareFeedback(''), 2000);
  };

  const handleEditProduct = () => {
    router.push(`/products/${productId}/edit`);
  };

  const handleDeleteProduct = async () => {
    if (deletingProduct || !window.confirm('이 상품을 삭제할까요?')) {
      return;
    }

    setDeletingProduct(true);

    try {
      await deleteProduct(productId);
      router.replace('/');
    } catch (error) {
      console.error('Failed to delete product', error);
      window.alert('상품 삭제에 실패했어요. 잠시 후 다시 시도해주세요.');
      setDeletingProduct(false);
    }
  };

  const handleCarouselScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (target.clientWidth === 0) {
      return;
    }
    const index = Math.round(target.scrollLeft / target.clientWidth);
    setActiveImageIndex(index);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-10 text-text-primary">
        <LoadingState message="상품 정보를 불러오는 중이에요…" />
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-10 text-text-primary">
        <ErrorState
          title="상품을 찾을 수 없어요"
          description="삭제되었거나 존재하지 않는 상품이에요."
          actionLabel="홈으로"
          onRetry={() => router.replace('/')}
        />
      </main>
    );
  }

  const imageUrls = images.map((image) => getProductImageUrl(image.storage_path));

  return (
    <main className="min-h-screen bg-white text-text-primary">
      {shareFeedback ? (
        <div className="pointer-events-none fixed inset-x-0 top-16 z-10 flex justify-center">
          <span className="rounded-full bg-black/70 px-4 py-2 text-xs font-medium text-white">
            {shareFeedback}
          </span>
        </div>
      ) : null}

      <header className="flex items-center justify-between px-3 py-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-cream"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-1">
          {userId && userId === product.user_id ? (
            <>
              <button
                type="button"
                onClick={handleEditProduct}
                aria-label="상품 수정"
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-cream"
              >
                <Pencil className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                disabled={deletingProduct}
                aria-label="상품 삭제"
                className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-cream disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={handleShare}
            aria-label="공유하기"
            className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-cream"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="relative">
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="flex aspect-square w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
        >
          {imageUrls.length > 0 ? (
            imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`${product.title} 이미지 ${index + 1}`}
                className="h-full w-full flex-shrink-0 snap-center object-cover"
              />
            ))
          ) : (
            <div className="flex h-full w-full flex-shrink-0 items-center justify-center bg-cream">
              <img
                src="/assets/mascot/sun_01_base.svg"
                alt="Good Morning mascot"
                className="h-24 w-24"
              />
            </div>
          )}
        </div>

        {imageUrls.length > 1 ? (
          <>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {imageUrls.map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    index === activeImageIndex ? 'bg-white' : 'bg-white/50',
                  )}
                />
              ))}
            </div>
            <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white">
              {activeImageIndex + 1}/{imageUrls.length}
            </div>
          </>
        ) : null}
      </div>

      <div className="space-y-5 px-5 py-5 pb-28">
        <div>
          <h1 className="text-lg font-bold">{product.title}</h1>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xl font-extrabold">{product.price.toLocaleString('ko-KR')}원</p>
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={likePending}
              className="flex items-center gap-1 text-sm text-text-secondary"
            >
              <Heart
                className={cn(
                  'h-5 w-5',
                  likeState.likedByUser ? 'fill-like text-like' : 'text-text-secondary',
                )}
              />
              <span>{likeState.count}</span>
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex rounded-full border border-border px-3 py-1 text-xs font-medium text-text-secondary">
              {CONDITION_LABELS[product.condition]}
            </span>
            <span className="text-xs text-text-secondary">{formatRelativeDate(product.created_at)}</span>
          </div>
        </div>

        <p className="whitespace-pre-line text-base leading-7 text-text-secondary">
          {product.description}
        </p>

        <div className="flex items-center gap-3 border-t border-border pt-4">
          <Avatar src={seller?.avatar_url} nickname={seller?.nickname ?? '알 수 없음'} size="md" />
          <div>
            <p className="text-sm font-semibold">{seller?.nickname ?? '알 수 없음'}</p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h2 className="text-sm font-bold">댓글 {comments.length}</h2>

          {commentsLoading ? (
            <div className="py-6">
              <LoadingState message="댓글을 불러오는 중이에요…" />
            </div>
          ) : comments.length === 0 ? (
            <div className="py-6">
              <EmptyState title="아직 댓글이 없어요" description="첫 댓글을 남겨보세요." />
            </div>
          ) : (
            <div className="mt-1 divide-y divide-border">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  canDelete={comment.user_id === userId}
                  deletePending={deletingCommentId === comment.id}
                  onDelete={() => handleDeleteComment(comment.id)}
                  onReply={() => handleReplyToComment(comment.author?.nickname ?? '알 수 없음')}
                />
              ))}
            </div>
          )}

          {commentDeleteError ? (
            <div className="py-4">
              <ErrorState
                title="댓글 삭제에 실패했어요"
                description="잠시 후 다시 시도해주세요."
                actionLabel="닫기"
                onRetry={() => setCommentDeleteError(false)}
              />
            </div>
          ) : null}

          {userId ? (
            <form onSubmit={handleSubmitComment} className="mt-4 flex items-end gap-2">
              <TextArea
                ref={commentInputRef}
                value={commentContent}
                onChange={(event) => setCommentContent(event.target.value)}
                placeholder="댓글을 남겨보세요"
                rows={1}
                className="min-h-0 max-h-[160px] flex-1 resize-none overflow-y-auto py-2.5"
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={commentSubmitting || commentContent.trim().length === 0}
                className="shrink-0 px-4 py-2.5"
              >
                {commentSubmitting ? '등록 중…' : '등록'}
              </Button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="mt-4 w-full rounded-button border border-border py-3 text-sm font-semibold text-text-secondary transition hover:bg-cream"
            >
              로그인 후 댓글을 남길 수 있어요
            </button>
          )}

          {commentSubmitError ? (
            <div className="py-4">
              <ErrorState
                title="댓글 등록에 실패했어요"
                description="잠시 후 다시 시도해주세요."
                actionLabel="다시 시도"
                onRetry={() => submitComment(commentContent.trim())}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-white px-4 py-3">
        <button
          type="button"
          onClick={handleToggleLike}
          disabled={likePending}
          className="flex w-full items-center justify-center gap-1.5 rounded-button bg-like px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-like/90"
        >
          <Heart className={cn('h-4 w-4', likeState.likedByUser && 'fill-white')} />
          좋아요
        </button>
      </div>
    </main>
  );
}
