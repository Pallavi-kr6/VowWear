import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureUserProfile } from '@/lib/userProfile';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unexpected server error';
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const response = NextResponse.json({
      profile: !error && profile ? profile : {
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name ?? null,
        last_name: user.user_metadata?.last_name ?? null,
        gender: null,
        profile_image_url: null,
      },
    });
    
    // Cache user profile for 5 minutes to reduce database load
    response.headers.set('Cache-Control', 'private, max-age=300');
    return response;
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureUserProfile(supabase, user);

    const body = await request.json();
    const { first_name, last_name, gender, profile_image_url } = body;

    const { data: profile, error } = await supabase
      .from('users')
      .update({
        first_name,
        last_name,
        gender,
        profile_image_url,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile });
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: 500 });
  }
}
