-- ====================================================================
-- ShadiStyle Complete Database Schema and RLS Setup
-- ====================================================================
-- Run this entire script in Supabase SQL Editor to initialize the database
-- with all tables, indexes, triggers, and Row Level Security policies.
-- ====================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 1. USERS TABLE (Extends Supabase auth.users)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    profile_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 2. USER PREFERENCES
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    preferred_gender TEXT CHECK (preferred_gender IN ('male', 'female', 'other', 'any')),
    wedding_functions TEXT[] DEFAULT '{}',
    preferred_colors TEXT[] DEFAULT '{}',
    outfit_styles TEXT[] DEFAULT '{}',
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    size TEXT,
    location TEXT,
    body_type TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 3. OUTFITS / PRODUCTS CATALOG
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.outfits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'unisex')),
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    image_urls TEXT[] DEFAULT '{}',
    brand TEXT,
    product_url TEXT,
    tags TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 4. AI RECOMMENDATIONS (Outfit-based)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
    score DECIMAL(4, 3) NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, outfit_id)
);

-- ====================================================================
-- 5. SAVED / WISHLIST
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.saved_outfits (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, outfit_id)
);

-- ====================================================================
-- 6. USER STYLE SEARCHES (Natural Language)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.user_style_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    parsed_request JSONB DEFAULT '{}'::jsonb,
    search_queries TEXT[] DEFAULT '{}',
    reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 7. SEARCH RECOMMENDATIONS (Natural Language)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.search_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_id UUID NOT NULL REFERENCES public.user_style_searches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    source TEXT,
    price TEXT,
    image TEXT,
    score NUMERIC(4, 3) DEFAULT 0.75,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 8. USER INTERACTIONS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
    interaction_type TEXT CHECK (interaction_type IN ('view', 'click', 'like', 'dislike', 'share')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- 9. OUTFIT REVIEWS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.outfit_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, outfit_id)
);

-- ====================================================================
-- 10. INDEXES FOR PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

CREATE INDEX IF NOT EXISTS idx_outfits_category ON public.outfits(category);
CREATE INDEX IF NOT EXISTS idx_outfits_gender ON public.outfits(gender);
CREATE INDEX IF NOT EXISTS idx_outfits_price ON public.outfits(price);
CREATE INDEX IF NOT EXISTS idx_outfits_brand ON public.outfits(brand);
CREATE INDEX IF NOT EXISTS idx_outfits_tags ON public.outfits USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_outfits_colors ON public.outfits USING GIN (colors);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_score ON public.recommendations(score DESC);

CREATE INDEX IF NOT EXISTS idx_user_style_searches_user_created ON public.user_style_searches(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_recommendations_search_score ON public.search_recommendations(search_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_search_recommendations_user_created ON public.search_recommendations(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_outfit_id ON public.user_interactions(outfit_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON public.user_interactions(interaction_type);

CREATE INDEX IF NOT EXISTS idx_outfit_reviews_user_id ON public.outfit_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_reviews_outfit_id ON public.outfit_reviews(outfit_id);
CREATE INDEX IF NOT EXISTS idx_saved_outfits_user_id ON public.saved_outfits(user_id);

-- ====================================================================
-- 11. AUTO-UPDATE TRIGGERS FOR updated_at COLUMNS
-- ====================================================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_modtime ON public.users;
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_user_pref_modtime ON public.user_preferences;
CREATE TRIGGER update_user_pref_modtime BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_outfits_modtime ON public.outfits;
CREATE TRIGGER update_outfits_modtime BEFORE UPDATE ON public.outfits FOR EACH ROW EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_reviews_modtime ON public.outfit_reviews;
CREATE TRIGGER update_reviews_modtime BEFORE UPDATE ON public.outfit_reviews FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ====================================================================
-- 12. ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_style_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_reviews ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- 13. GRANT PERMISSIONS TO AUTHENTICATED USERS
-- ====================================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.outfits TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.saved_outfits TO authenticated;
GRANT SELECT, INSERT ON public.recommendations TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_style_searches TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.search_recommendations TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_interactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outfit_reviews TO authenticated;

-- ====================================================================
-- 14. RLS POLICIES - USERS TABLE
-- ====================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ====================================================================
-- 15. RLS POLICIES - USER PREFERENCES TABLE
-- ====================================================================
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON public.user_preferences;
CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own preferences" ON public.user_preferences;
CREATE POLICY "Users can delete own preferences"
  ON public.user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================================================
-- 16. RLS POLICIES - OUTFITS TABLE (Public Read)
-- ====================================================================
DROP POLICY IF EXISTS "Anyone can view active outfits" ON public.outfits;
CREATE POLICY "Anyone can view active outfits"
  ON public.outfits FOR SELECT
  USING (is_active = true);

-- ====================================================================
-- 17. RLS POLICIES - SAVED OUTFITS TABLE
-- ====================================================================
DROP POLICY IF EXISTS "Users can view own saved outfits" ON public.saved_outfits;
CREATE POLICY "Users can view own saved outfits"
  ON public.saved_outfits FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved outfits" ON public.saved_outfits;
CREATE POLICY "Users can insert own saved outfits"
  ON public.saved_outfits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved outfits" ON public.saved_outfits;
CREATE POLICY "Users can delete own saved outfits"
  ON public.saved_outfits FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================================================
-- 18. RLS POLICIES - RECOMMENDATIONS TABLE
-- ====================================================================
DROP POLICY IF EXISTS "Users can view own recommendations" ON public.recommendations;
CREATE POLICY "Users can view own recommendations"
  ON public.recommendations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own recommendations" ON public.recommendations;
CREATE POLICY "Users can insert own recommendations"
  ON public.recommendations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- 19. RLS POLICIES - USER STYLE SEARCHES TABLE
-- ====================================================================
DROP POLICY IF EXISTS "Users can view own style searches" ON public.user_style_searches;
CREATE POLICY "Users can view own style searches"
  ON public.user_style_searches FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own style searches" ON public.user_style_searches;
CREATE POLICY "Users can insert own style searches"
  ON public.user_style_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own style searches" ON public.user_style_searches;
CREATE POLICY "Users can delete own style searches"
  ON public.user_style_searches FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================================================
-- 20. RLS POLICIES - SEARCH RECOMMENDATIONS TABLE (FIXED)
-- ====================================================================
DROP POLICY IF EXISTS "Users can view own search recommendations" ON public.search_recommendations;
CREATE POLICY "Users can view own search recommendations"
  ON public.search_recommendations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own search recommendations" ON public.search_recommendations;
CREATE POLICY "Users can insert own search recommendations"
  ON public.search_recommendations FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.user_style_searches searches
      WHERE searches.id = search_recommendations.search_id
        AND searches.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own search recommendations" ON public.search_recommendations;
CREATE POLICY "Users can delete own search recommendations"
  ON public.search_recommendations FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================================================
-- 21. RLS POLICIES - USER INTERACTIONS TABLE
-- ====================================================================
DROP POLICY IF EXISTS "Users can view own interactions" ON public.user_interactions;
CREATE POLICY "Users can view own interactions"
  ON public.user_interactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own interactions" ON public.user_interactions;
CREATE POLICY "Users can insert own interactions"
  ON public.user_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- 22. RLS POLICIES - OUTFIT REVIEWS TABLE
-- ====================================================================
DROP POLICY IF EXISTS "Anyone can view reviews of active outfits" ON public.outfit_reviews;
CREATE POLICY "Anyone can view reviews of active outfits"
  ON public.outfit_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.outfits
      WHERE outfits.id = outfit_reviews.outfit_id
        AND outfits.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can view own reviews" ON public.outfit_reviews;
CREATE POLICY "Users can view own reviews"
  ON public.outfit_reviews FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reviews" ON public.outfit_reviews;
CREATE POLICY "Users can insert own reviews"
  ON public.outfit_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reviews" ON public.outfit_reviews;
CREATE POLICY "Users can update own reviews"
  ON public.outfit_reviews FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reviews" ON public.outfit_reviews;
CREATE POLICY "Users can delete own reviews"
  ON public.outfit_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================================================
-- Setup Complete!
-- ====================================================================
-- All tables, indexes, triggers, and RLS policies have been created.
-- Your ShadiStyle application is ready to use.
-- ====================================================================
