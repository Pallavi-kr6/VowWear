import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MOCK_OUTFITS } from '@/lib/mockData';

export async function POST(request: Request) {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get User Preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!preferences) {
      return NextResponse.json({ error: 'No preferences found.' }, { status: 400 });
    }

    // 2. Simple local filtering based on MOCK data (Simulating AI/DB filter)
    let filteredOutfits = MOCK_OUTFITS;

    // Filter by gender if not 'any'
    if (preferences.preferred_gender && preferences.preferred_gender !== 'any') {
      filteredOutfits = filteredOutfits.filter(o => o.gender === preferences.preferred_gender || o.gender === 'unisex');
    }

    // Filter by max budget
    if (preferences.budget_max) {
      filteredOutfits = filteredOutfits.filter(o => o.price <= preferences.budget_max);
    }

    // Sort by relevance (mock scoring based on color and style tags)
    const scoredOutfits = filteredOutfits.map(outfit => {
      let score = 0.5; // Base score
      let reason = 'A great choice for your occasion.';

      // Boost score if colors match
      const colorMatch = outfit.colors.some(c => preferences.preferred_colors?.includes(c));
      if (colorMatch) {
        score += 0.2;
        reason = 'Matches your preferred color palette beautifully.';
      }

      // Boost score if style matches
      const styleMatch = outfit.tags.some(t => preferences.outfit_styles?.includes(t));
      if (styleMatch) {
        score += 0.2;
        reason = 'Perfectly aligns with your desired style.';
      }

      // Add a tiny random variance to make it look dynamic
      score += Math.random() * 0.09;
      if (score > 0.99) score = 0.99;

      return {
        ...outfit,
        score,
        reason
      };
    }).sort((a, b) => b.score - a.score).slice(0, 5); // Return top 5

    // In a real app, we would save to `recommendations` table using DB IDs.
    // Because we're using mock IDs ('m1', 'm2') which aren't UUIDs, inserting them 
    // into the Postgres DB will throw UUID casting errors unless we seed the DB.
    // For this mock MVP step, we will just return the JSON directly so the Dashboard can render it.

    return NextResponse.json({ recommendations: scoredOutfits });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
