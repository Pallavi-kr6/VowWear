import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  // Extract pagination
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  // Extract filters
  const category = searchParams.get('category');
  const gender = searchParams.get('gender');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const colors = searchParams.getAll('colors'); // ?colors=red&colors=blue
  const tags = searchParams.getAll('tags');

  // Sorting
  const sort = searchParams.get('sort') || 'created_at';
  const order = searchParams.get('order') || 'desc';

  try {
    let query = supabase
      .from('outfits')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Apply filters
    if (category) query = query.eq('category', category);
    if (gender) query = query.eq('gender', gender);
    if (minPrice) query = query.gte('price', minPrice);
    if (maxPrice) query = query.lte('price', maxPrice);
    if (colors.length > 0) query = query.contains('colors', colors);
    if (tags.length > 0) query = query.contains('tags', tags);

    // Apply sorting and pagination
    query = query
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: outfits, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      outfits,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
