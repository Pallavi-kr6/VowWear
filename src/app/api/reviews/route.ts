import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { outfit_id, rating, review_text } = await request.json();

    if (!outfit_id || !rating) {
      return NextResponse.json({ error: 'Missing outfit_id or rating' }, { status: 400 });
    }

    const { data: review, error } = await supabase
      .from('outfit_reviews')
      .upsert({
        user_id: user.id,
        outfit_id,
        rating,
        review_text
      }, { onConflict: 'user_id,outfit_id' }) // Because of UNIQUE constraint
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ review });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
