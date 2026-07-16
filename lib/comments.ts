import { createClient } from '@/lib/supabase/supabaseClient';
import type { Comment } from '@/types/comment';
import type { Profile } from '@/types/profile';

export type CommentWithAuthor = Comment & {
  author: Pick<Profile, 'id' | 'nickname' | 'avatar_url'> | null;
};

export async function getComments(productId: string): Promise<CommentWithAuthor[]> {
  const supabase = createClient();
  const { data: comments, error } = await supabase
    .from('comments')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: true });

  if (error || !comments || comments.length === 0) {
    return [];
  }

  const userIds = Array.from(new Set(comments.map((comment: Comment) => comment.user_id)));

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .in('id', userIds);

  if (profilesError) {
    console.error('Failed to load comment authors', profilesError);
  }

  type AuthorRow = Pick<Profile, 'id' | 'nickname' | 'avatar_url'>;

  return comments.map((comment: Comment) => ({
    ...comment,
    author:
      (profiles as AuthorRow[] | null)?.find((profile) => profile.id === comment.user_id) ?? null,
  }));
}

export async function createComment(
  productId: string,
  userId: string,
  content: string,
): Promise<Comment> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('comments')
    .insert({ product_id: productId, user_id: userId, content })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}
