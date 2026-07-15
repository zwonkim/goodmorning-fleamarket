import { createClient } from '@/lib/supabase/supabaseClient';
import type { Profile } from '@/types/profile';

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function createProfile(
  userId: string,
  email: string,
  nickname: string,
): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, email, nickname })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
