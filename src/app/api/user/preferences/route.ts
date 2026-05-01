import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ensureUserProfile } from '@/lib/userProfile';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;

  if (typeof error === 'object' && error && 'message' in error) {
    return String(error.message);
  }

  return 'Unexpected server error';
}

function getErrorStatus(error: unknown) {
  if (typeof error === 'object' && error && 'code' in error) {
    const code = String(error.code);
    if (code === '42501') return 403;
    if (code === '23503' || code === '23505') return 409;
  }

  return 500;
}

function getErrorCode(error: unknown) {
  if (typeof error === 'object' && error && 'code' in error) {
    return String(error.code);
  }

  return undefined;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    return NextResponse.json({ preferences: error ? null : preferences || null });
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: getErrorStatus(err) });
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    try {
      await ensureUserProfile(supabase, user);
    } catch (err: unknown) {
      return NextResponse.json(
        {
          error: `Could not create user profile: ${getErrorMessage(err)}`,
          code: getErrorCode(err),
        },
        { status: getErrorStatus(err) }
      );
    }

    const body = await request.json();
    const { 
      preferred_gender, 
      wedding_functions, 
      preferred_colors, 
      outfit_styles, 
      budget_min, 
      budget_max,
      size,
      location,
      body_type,
      is_completed,
    } = body;

    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        preferred_gender,
        wedding_functions,
        preferred_colors,
        outfit_styles,
        budget_min,
        budget_max,
        size,
        location,
        body_type,
        is_completed,
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          error: `Could not save preferences: ${getErrorMessage(error)}`,
          code: getErrorCode(error),
        },
        { status: getErrorStatus(error) }
      );
    }

    // TODO: Ideally trigger a background job to regenerate recommendations here
    // or call the generate recommendation API directly if it's fast enough.

    return NextResponse.json({ preferences });
  } catch (err: unknown) {
    return NextResponse.json({ error: getErrorMessage(err) }, { status: getErrorStatus(err) });
  }
}
