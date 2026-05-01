import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: savedOutfits, error } = await supabase
      .from('saved_outfits')
      .select('*, outfits(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ savedOutfits });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { outfit_id } = await request.json();

    if (!outfit_id) {
      return NextResponse.json({ error: 'Missing outfit_id' }, { status: 400 });
    }

    const { data: savedOutfit, error } = await supabase
      .from('saved_outfits')
      .insert({
        user_id: user.id,
        outfit_id
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ savedOutfit });
  } catch (err: any) {
    if (err.code === '23505') { // Unique violation
       return NextResponse.json({ message: 'Already saved' });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const outfit_id = searchParams.get('outfit_id');
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!outfit_id) {
    return NextResponse.json({ error: 'Missing outfit_id' }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('saved_outfits')
      .delete()
      .eq('user_id', user.id)
      .eq('outfit_id', outfit_id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
