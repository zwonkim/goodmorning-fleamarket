'use client';

import { Trash2 } from 'lucide-react';
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

  const mentionMatch = /^@(\S+)\s/.exec(comment.content);
  const mention = mentionMatch ? `@${mentionMatch[1]}` : null;
  const contentWithoutMention = mentionMatch
    ? comment.content.slice(mentionMatch[0].length)
    : comment.content;

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
              aria-label="댓글 삭제"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-text-secondary transition hover:text-danger disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-text-primary">
          {mention ? (
            <>
              <span className="mr-1 font-bold">{mention}</span>
              {contentWithoutMention}
            </>
          ) : (
            comment.content
          )}
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
