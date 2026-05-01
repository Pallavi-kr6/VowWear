import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: recommendations, error } = await supabase
      .from('recommendations')
      .select('*, outfits(*)')
      .eq('user_id', user.id)
      .order('score', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ recommendations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
