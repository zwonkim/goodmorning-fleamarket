import { createClient } from '@/lib/supabase/supabaseClient';

export type LikeState = {
  count: number;
  likedByUser: boolean;
};

export async function getLikeState(
  productId: string,
  userId: string | null,
): Promise<LikeState> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('likes')
    .select('user_id')
    .eq('product_id', productId);

  if (error || !data) {
    return { count: 0, likedByUser: false };
  }

  return {
    count: data.length,
    likedByUser: userId
      ? data.some((like: { user_id: string }) => like.user_id === userId)
      : false,
  };
}

export async function likeProduct(productId: string, userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('likes')
    .insert({ product_id: productId, user_id: userId });

  if (error) {
    throw error;
  }
}

export async function unlikeProduct(productId: string, userId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('product_id', productId)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}
