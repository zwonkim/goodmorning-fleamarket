'use client';

import { Avatar } from '@/components/common/Avatar';
import { formatRelativeDate } from '@/lib/utils';
import type { CommentWithAuthor } from '@/lib/comments';

interface CommentItemProps {
  comment: CommentWithAuthor;
  canDelete: boolean;
  deletePending?: boolean;
  onDelete?: () => void;
  onReply?: () => void;
}

export function CommentItem({
  comment,
  canDelete,
  deletePending,
  onDelete,
  onReply,
}: CommentItemProps) {
  const nickname = comment.author?.nickname ?? '알 수 없음';

  return (
    <div className="flex gap-3 py-3">
      <Avatar src={comment.author?.avatar_url} nickname={nickname} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold">{nickname}</p>
            <span className="shrink-0 text-xs text-text-secondary">
              {formatRelativeDate(comment.created_at)}
            </span>
          </div>
          {canDelete ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={deletePending}
              className="shrink-0 text-xs text-text-secondary transition hover:text-danger disabled:opacity-50"
            >
              삭제
            </button>
          ) : null}
        </div>
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-text-primary">
          {comment.content}
        </p>
        <button
          type="button"
          onClick={onReply}
          className="mt-1 text-xs font-medium text-text-secondary transition hover:text-text-primary"
        >
          답글
        </button>
      </div>
    </div>
  );
}
