import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { outfit_id, interaction_type } = await request.json();

    if (!outfit_id || !interaction_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: interaction, error } = await supabase
      .from('user_interactions')
      .insert({
        user_id: user.id,
        outfit_id,
        interaction_type
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ interaction });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: interactions, error } = await supabase
      .from('user_interactions')
      .select('*, outfits(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ interactions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
