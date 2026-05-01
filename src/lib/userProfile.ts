import type { User } from '@supabase/supabase-js';

type SupabaseClient = ReturnType<typeof import('@/lib/supabase/server').createClient> extends Promise<infer T>
  ? T
  : never;

export async function ensureUserProfile(supabase: SupabaseClient, user: User) {
  const { data: existingProfile, error: selectError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  if (existingProfile) {
    return existingProfile;
  }

  const { data: profile, error: insertError } = await supabase
    .from('users')
    .insert({
      id: user.id,
      email: user.email ?? '',
      first_name: user.user_metadata?.first_name ?? null,
      last_name: user.user_metadata?.last_name ?? null,
    })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return profile;
}
