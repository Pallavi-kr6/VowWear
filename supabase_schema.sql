-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Users Table (Extends Supabase auth.users)
-- ==========================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    profile_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. User Preferences
-- ==========================================
CREATE TABLE public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    preferred_gender TEXT CHECK (preferred_gender IN ('male', 'female', 'other', 'any')),
    wedding_functions TEXT[] DEFAULT '{}', -- e.g., ['haldi', 'mehendi', 'wedding', 'reception']
    preferred_colors TEXT[] DEFAULT '{}',
    outfit_styles TEXT[] DEFAULT '{}', -- e.g., ['traditional', 'indo-western', 'modern']
    budget_min DECIMAL(10, 2),
    budget_max DECIMAL(10, 2),
    size TEXT, -- e.g., 'S', 'M', 'L', 'XL'
    location TEXT,
    body_type TEXT,
    is_completed BOOLEAN DEFAULT FALSE, -- Track if onboarding is done
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. Outfits / Products Catalog
-- ==========================================
CREATE TABLE public.outfits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- e.g., 'lehenga', 'saree', 'sherwani', 'suit'
    gender TEXT CHECK (gender IN ('male', 'female', 'unisex')),
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT, -- Primary image
    image_urls TEXT[] DEFAULT '{}',
    brand TEXT, -- e.g., 'Myntra', 'Amazon', 'Manyavar'
    product_url TEXT, -- External link to buy
    tags TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. AI Recommendations
-- ==========================================
CREATE TABLE public.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
    score DECIMAL(4, 3) NOT NULL, -- e.g., 0.952 relevance score
    reason TEXT, -- Explanation for why this was recommended
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, outfit_id) -- Prevents duplicate recommendations for the same pair
);

-- ==========================================
-- 5. Saved / Wishlist
-- ==========================================
CREATE TABLE public.saved_outfits (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, outfit_id)
);

-- ==========================================
-- 6. Sessions / Interactions
-- ==========================================
CREATE TABLE public.user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
    interaction_type TEXT CHECK (interaction_type IN ('view', 'click', 'like', 'dislike', 'share')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 7. Reviews / Feedback
-- ==========================================
CREATE TABLE public.outfit_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, outfit_id) -- Ensure one review per user per outfit
);

-- ==========================================
-- 8. Indexes for Performance
-- ==========================================
-- Users
CREATE INDEX idx_users_email ON public.users(email);

-- Outfits
CREATE INDEX idx_outfits_category ON public.outfits(category);
CREATE INDEX idx_outfits_gender ON public.outfits(gender);
CREATE INDEX idx_outfits_price ON public.outfits(price);
CREATE INDEX idx_outfits_brand ON public.outfits(brand);
-- GIN indexes for array columns to enable fast searching/filtering
CREATE INDEX idx_outfits_tags ON public.outfits USING GIN (tags);
CREATE INDEX idx_outfits_colors ON public.outfits USING GIN (colors);

-- Recommendations
CREATE INDEX idx_recommendations_user_id ON public.recommendations(user_id);
CREATE INDEX idx_recommendations_score ON public.recommendations(score DESC);

-- Interactions
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX idx_user_interactions_outfit_id ON public.user_interactions(outfit_id);
CREATE INDEX idx_user_interactions_type ON public.user_interactions(interaction_type);

-- ==========================================
-- 9. Auto-update `updated_at` Triggers
-- ==========================================
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_user_pref_modtime BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_outfits_modtime BEFORE UPDATE ON public.outfits FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_reviews_modtime BEFORE UPDATE ON public.outfit_reviews FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ==========================================
-- 10. Row Level Security (RLS) Basics
-- ==========================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

-- Sample Policies
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;

CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own preferences" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active outfits" ON public.outfits FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage own saved outfits" ON public.saved_outfits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own recommendations" ON public.recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interactions" ON public.user_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
