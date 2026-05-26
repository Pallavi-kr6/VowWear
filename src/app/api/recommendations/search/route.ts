import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import groq from '@/lib/groq/client';
import {
  buildShoppingSearchPrompt,
  buildSearchRankingPrompt,
  type SearchPlan,
} from '@/lib/groq/searchPrompts';

type RawSearchResult = {
  title: string;
  url: string;
  snippet?: string;
  source: string;
  image?: string | null;
  price?: string | null;
};

type SerpApiShoppingItem = {
  title?: string;
  product_link?: string;
  link?: string;
  snippet?: string;
  extensions?: string[];
  source?: string;
  thumbnail?: string;
  price?: string;
};

type SerpApiOrganicItem = {
  title?: string;
  link?: string;
  snippet?: string;
  source?: string;
  thumbnail?: string;
  rich_snippet?: {
    top?: {
      detected_extensions?: {
        price?: number;
        currency?: string;
      };
    };
  };
};

type GoogleCustomSearchItem = {
  title?: string;
  link?: string;
  snippet?: string;
  pagemap?: {
    cse_image?: { src?: string }[];
    cse_thumbnail?: { src?: string }[];
  };
};

type StoredRecommendation = RecommendationCandidate & {
  id?: string;
  search_id?: string;
  user_id?: string;
  created_at?: string;
};

type StoredSearch = {
  id: string;
  user_id: string;
  description: string;
  parsed_request?: Record<string, unknown>;
  search_queries?: string[];
  reasoning?: string | null;
  created_at: string;
  search_recommendations?: StoredRecommendation[];
};

type RecommendationCandidate = {
  title?: string;
  url?: string;
  source?: string;
  price?: string | null;
  image?: string | null;
  score?: number;
  reason?: string;
};

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
let serpApiBlockedUntil = 0;
let googleSearchBlockedUntil = 0;

function parseJsonObject<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    const match = value.match(/\{[\s\S]*\}/);
    if (!match) return fallback;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return fallback;
    }
  }
}

function normalizeUrlHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

function hasRequiredSearchFields(item: RawSearchResult): item is RawSearchResult {
  return Boolean(item.title && item.url);
}

function isProviderBlocked(until: number) {
  return until > Date.now();
}

function shouldTemporarilyBlock(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('429') || message.includes('403');
}

function buildStoreFallbackRecommendations(description: string, parsedRequest: SearchPlan['parsed_request']): RecommendationCandidate[] {
  const parsedParts = [
    parsedRequest.outfit_type,
    parsedRequest.occasion,
    parsedRequest.colors?.join(' '),
    parsedRequest.style?.join(' '),
    parsedRequest.max_budget ? `under ${parsedRequest.max_budget}` : undefined,
  ].filter(Boolean);

  const query = parsedParts.length > 0 ? parsedParts.join(' ') : description;
  const encoded = encodeURIComponent(query);

  return [
    {
      title: `Search Myntra for ${query}`,
      url: `https://www.myntra.com/${encoded}`,
      source: 'Myntra',
      price: parsedRequest.max_budget ? `Under Rs. ${parsedRequest.max_budget}` : null,
      image: null,
      score: 0.78,
      reason: 'Live product search APIs are currently rate-limited, so this opens a focused Myntra search for your request.',
    },
    {
      title: `Search Ajio for ${query}`,
      url: `https://www.ajio.com/search/?text=${encoded}`,
      source: 'Ajio',
      price: parsedRequest.max_budget ? `Under Rs. ${parsedRequest.max_budget}` : null,
      image: null,
      score: 0.76,
      reason: 'Ajio often has Indian wedding and occasion wear, and this search keeps your outfit, color, and budget terms.',
    },
    {
      title: `Search Nykaa Fashion for ${query}`,
      url: `https://www.nykaafashion.com/catalogsearch/result/?q=${encoded}`,
      source: 'Nykaa Fashion',
      price: parsedRequest.max_budget ? `Under Rs. ${parsedRequest.max_budget}` : null,
      image: null,
      score: 0.74,
      reason: 'Useful fallback for curated ethnicwear when product search provider quota is exhausted.',
    },
    {
      title: `Search Amazon Fashion for ${query}`,
      url: `https://www.amazon.in/s?k=${encoded}`,
      source: 'Amazon India',
      price: parsedRequest.max_budget ? `Under Rs. ${parsedRequest.max_budget}` : null,
      image: null,
      score: 0.7,
      reason: 'Broad marketplace fallback with many budget options for occasion wear.',
    },
  ];
}

async function serpApiShoppingSearch(query: string, apiKey: string): Promise<RawSearchResult[]> {
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google_shopping');
  url.searchParams.set('q', query);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('gl', 'in');
  url.searchParams.set('hl', 'en');
  url.searchParams.set('num', '10');

  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`SerpAPI request failed with ${response.status}`);
  }

  const data = await response.json() as { shopping_results?: SerpApiShoppingItem[] };
  return (data.shopping_results || []).map((item) => ({
    title: item.title || '',
    url: item.product_link || item.link || '',
    snippet: item.snippet || item.extensions?.join(', '),
    source: item.source || normalizeUrlHost(item.product_link || item.link || ''),
    image: item.thumbnail || null,
    price: item.price || null,
  })).filter(hasRequiredSearchFields);
}

async function serpApiOrganicSearch(query: string, apiKey: string): Promise<RawSearchResult[]> {
  const url = new URL('https://serpapi.com/search.json');
  url.searchParams.set('engine', 'google');
  url.searchParams.set('q', `${query} buy online India`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('gl', 'in');
  url.searchParams.set('hl', 'en');
  url.searchParams.set('num', '10');

  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`SerpAPI organic request failed with ${response.status}`);
  }

  const data = await response.json() as { organic_results?: SerpApiOrganicItem[] };
  return (data.organic_results || []).map((item) => {
    const detectedPrice = item.rich_snippet?.top?.detected_extensions?.price;
    const detectedCurrency = item.rich_snippet?.top?.detected_extensions?.currency;

    return {
      title: item.title || '',
      url: item.link || '',
      snippet: item.snippet,
      source: item.source || normalizeUrlHost(item.link || ''),
      image: item.thumbnail || null,
      price: detectedPrice ? `${detectedCurrency || 'Rs'} ${detectedPrice}` : null,
    };
  }).filter(hasRequiredSearchFields);
}

async function googleCustomSearch(query: string, apiKey: string, cseId: string): Promise<RawSearchResult[]> {
  const url = new URL('https://www.googleapis.com/customsearch/v1');
  url.searchParams.set('q', `${query} buy online India`);
  url.searchParams.set('key', apiKey);
  url.searchParams.set('cx', cseId);
  url.searchParams.set('num', '10');

  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Google Custom Search request failed with ${response.status}`);
  }

  const data = await response.json() as { items?: GoogleCustomSearchItem[] };
  return (data.items || []).map((item) => ({
    title: item.title || '',
    url: item.link || '',
    snippet: item.snippet,
    source: normalizeUrlHost(item.link || ''),
    image: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.cse_thumbnail?.[0]?.src || null,
    price: null,
  })).filter(hasRequiredSearchFields);
}

async function searchProducts(query: string): Promise<RawSearchResult[]> {
  const results: RawSearchResult[] = [];
  const serpApiKey = process.env.SERPAPI_API_KEY;

  if (serpApiKey && !isProviderBlocked(serpApiBlockedUntil)) {
    try {
      results.push(...await serpApiShoppingSearch(query, serpApiKey));
    } catch (error) {
      if (shouldTemporarilyBlock(error)) {
        serpApiBlockedUntil = Date.now() + 5 * 60 * 1000;
      }
      console.warn('SerpAPI shopping search failed:', error instanceof Error ? error.message : error);
    }

    if (results.length === 0 && !isProviderBlocked(serpApiBlockedUntil)) {
      try {
        results.push(...await serpApiOrganicSearch(query, serpApiKey));
      } catch (error) {
        if (shouldTemporarilyBlock(error)) {
          serpApiBlockedUntil = Date.now() + 5 * 60 * 1000;
        }
        console.warn('SerpAPI organic search failed:', error instanceof Error ? error.message : error);
      }
    }
  }

  const googleKey = process.env.GOOGLE_CUSTOM_SEARCH_KEY;
  const googleCseId = process.env.GOOGLE_CUSTOM_SEARCH_ID;
  if (results.length === 0 && googleKey && googleCseId && !isProviderBlocked(googleSearchBlockedUntil)) {
    try {
      results.push(...await googleCustomSearch(query, googleKey, googleCseId));
    } catch (error) {
      if (shouldTemporarilyBlock(error)) {
        googleSearchBlockedUntil = Date.now() + 5 * 60 * 1000;
      }
      console.warn('Google Custom Search failed:', error instanceof Error ? error.message : error);
    }
  }

  if (results.length > 0) {
    return results;
  }

  if (!serpApiKey && (!googleKey || !googleCseId)) {
    throw new Error('Missing search API credentials. Add SERPAPI_API_KEY or GOOGLE_CUSTOM_SEARCH_KEY and GOOGLE_CUSTOM_SEARCH_ID.');
  }

  return [];
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: searches, error } = await supabase
      .from('user_style_searches')
      .select('*, search_recommendations(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(12);

    if (error) throw error;

    return NextResponse.json({
      searches: ((searches || []) as StoredSearch[]).map((search) => ({
        ...search,
        recommendations: (search.search_recommendations || []).sort((a, b) => Number(b.score) - Number(a.score)),
        search_recommendations: undefined,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load searches';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const description = String(body.description || '').trim();

    if (description.length < 12) {
      return NextResponse.json(
        { error: 'Describe the outfit, occasion, budget, color, and style in a little more detail.' },
        { status: 400 }
      );
    }

    let plan: SearchPlan;
    try {
      const planCompletion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'You are a JSON-only Indian wedding fashion shopping assistant. Return only valid JSON.',
          },
          {
            role: 'user',
            content: buildShoppingSearchPrompt(description),
          },
        ],
      });

      plan = parseJsonObject<SearchPlan>(
        planCompletion.choices[0]?.message?.content || '{}',
        { queries: [], parsed_request: {}, reasoning: '' }
      );
    } catch (planError) {
      console.error('Groq plan creation failed:', planError instanceof Error ? planError.message : planError);
      throw new Error(`Failed to create search plan: ${planError instanceof Error ? planError.message : 'Unknown error'}`);
    }

    const queries = Array.isArray(plan.queries) ? plan.queries.filter(Boolean).slice(0, 3) : [];
    if (queries.length === 0) {
      queries.push(`${description} buy online India`);
    }

    const rawResults: RawSearchResult[] = [];
    for (const query of queries) {
      const results = await searchProducts(query);
      rawResults.push(...results);
      if (rawResults.length >= 12) break;
    }

    const uniqueResults = Array.from(
      new Map(rawResults.map((result) => [result.url, result])).values()
    ).slice(0, 30);

    let rankedRecommendations: RecommendationCandidate[];
    const isUsingFallback = uniqueResults.length === 0;
    
    if (isUsingFallback) {
      // When APIs fail, return store fallbacks directly without AI ranking
      rankedRecommendations = buildStoreFallbackRecommendations(description, plan.parsed_request);
    } else {
      try {
        const rankingCompletion = await groq.chat.completions.create({
          model: GROQ_MODEL,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: 'You are a JSON-only Indian wedding stylist. Return only valid JSON.',
            },
            {
              role: 'user',
              content: buildSearchRankingPrompt(description, plan.parsed_request, uniqueResults),
            },
          ],
        });

        const ranked = parseJsonObject<{ recommendations: RecommendationCandidate[] }>(
          rankingCompletion.choices[0]?.message?.content || '{}',
          { recommendations: [] }
        );
        rankedRecommendations = ranked.recommendations;
      } catch (rankingError) {
        // If Groq ranking fails, fall back to store recommendations
        console.warn('Groq ranking failed, using store fallbacks:', rankingError instanceof Error ? rankingError.message : rankingError);
        rankedRecommendations = buildStoreFallbackRecommendations(description, plan.parsed_request);
      }
    }

    const recommendations = (Array.isArray(rankedRecommendations) ? rankedRecommendations : [])
      .filter((item) => item?.title && item?.url)
      .slice(0, 8)
      .map((item) => ({
        title: String(item.title),
        url: String(item.url),
        source: String(item.source || normalizeUrlHost(item.url || '')),
        price: item.price ? String(item.price) : null,
        image: item.image ? String(item.image) : null,
        score: Math.max(0, Math.min(1, Number(item.score) || 0.75)),
        reason: String(item.reason || 'Matches your outfit request.'),
      }));

    if (recommendations.length === 0) {
      // Should not happen with fallbacks, but if it does, return store links anyway
      const lastResortFallback = buildStoreFallbackRecommendations(description, plan.parsed_request);
      if (lastResortFallback.length === 0) {
        return NextResponse.json({ error: 'Unable to find or generate product recommendations. Try a different search.' }, { status: 502 });
      }
      return NextResponse.json({
        search: { id: 'unsaved', user_id: user.id, description, created_at: new Date().toISOString() },
        recommendations: lastResortFallback,
        metadata: { queries, total_results: 0, fallback: true },
      });
    }

    const { data: search, error: searchInsertError } = await supabase
      .from('user_style_searches')
      .insert({
        user_id: user.id,
        description,
        parsed_request: plan.parsed_request || {},
        search_queries: queries,
        reasoning: plan.reasoning || null,
      })
      .select()
      .single();

    if (searchInsertError) {
      console.error('Failed to insert search record:', searchInsertError);
      throw new Error(`Database error saving search: ${searchInsertError.message}`);
    }

    const { data: savedRecommendations, error: recInsertError } = await supabase
      .from('search_recommendations')
      .insert(recommendations.map((recommendation) => ({
        search_id: search.id,
        user_id: user.id,
        ...recommendation,
      })))
      .select();

    if (recInsertError) {
      console.error('Failed to insert recommendations:', recInsertError);
      throw new Error(`Database error saving recommendations: ${recInsertError.message}`);
    }

    return NextResponse.json({
      search,
      recommendations: savedRecommendations || recommendations,
      metadata: {
        queries,
        parsed_request: plan.parsed_request,
        reasoning: plan.reasoning,
        total_results: uniqueResults.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate recommendations';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
