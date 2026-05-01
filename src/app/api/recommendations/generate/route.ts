import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import groq from '@/lib/groq/client';
import { generateRecommendationPrompt } from '@/lib/groq/prompts';

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
      return NextResponse.json({ error: 'No preferences found. Please complete onboarding.' }, { status: 400 });
    }

    // 2. Get Recent Interactions
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('outfit_id, interaction_type, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    // 3. Get Available Catalog (filtered basically by gender/budget to save tokens)
    let catalogQuery = supabase.from('outfits').select('*').eq('is_active', true);
    
    if (preferences.preferred_gender && preferences.preferred_gender !== 'any') {
      catalogQuery = catalogQuery.eq('gender', preferences.preferred_gender);
    }
    
    const { data: catalog } = await catalogQuery.limit(50); // Get top 50 to send to LLM

    if (!catalog || catalog.length === 0) {
      return NextResponse.json({ error: 'No outfits available to recommend.' }, { status: 404 });
    }

    // 4. Call Groq AI
    const prompt = generateRecommendationPrompt(preferences, interactions || [], catalog);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful JSON-only fashion AI. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "mixtral-8x7b-32768", // Or llama3-70b-8192
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const aiResponseText = completion.choices[0]?.message?.content;
    
    if (!aiResponseText) {
      throw new Error("AI did not return a response.");
    }

    let recommendationsObj;
    try {
       // Parse the JSON. Depending on how the LLM formatted it, it might be { recommendations: [...] } or just [...]
       const parsed = JSON.parse(aiResponseText);
       if (Array.isArray(parsed)) recommendationsObj = parsed;
       else if (parsed.recommendations) recommendationsObj = parsed.recommendations;
       else recommendationsObj = Object.values(parsed)[0]; // fallback
    } catch(e) {
       console.error("Failed to parse AI response:", aiResponseText);
       throw new Error("Invalid AI JSON format");
    }

    if (!Array.isArray(recommendationsObj)) {
      throw new Error("AI did not return an array of recommendations.");
    }

    // 5. Store in Supabase `recommendations` table
    // First, optionally clear old ones to keep it fresh
    await supabase.from('recommendations').delete().eq('user_id', user.id);

    const inserts = recommendationsObj.map((rec: any) => ({
      user_id: user.id,
      outfit_id: rec.outfit_id,
      score: rec.score || 0.8,
      reason: rec.reason || 'Recommended based on your profile.',
    })).filter((rec: any) => rec.outfit_id); // Ensure valid IDs

    if (inserts.length > 0) {
       const { error: insertError } = await supabase.from('recommendations').insert(inserts);
       if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true, count: inserts.length, data: inserts });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
