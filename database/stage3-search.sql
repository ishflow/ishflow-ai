-- ============================================
-- ISHFLOW.AI - Stage 3: Public Search Support
-- ============================================
-- Run this in Supabase SQL Editor
-- Adds public-facing fields and policies for search
-- ============================================

-- ============================================
-- 1. PARTNERS TABLE (if not exists)
-- ============================================
-- This table stores partner/business information
-- linked to auth.users

CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    city VARCHAR(100),
    address TEXT,
    category VARCHAR(100),
    logo_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for search
CREATE INDEX IF NOT EXISTS idx_partners_city ON public.partners(city);
CREATE INDEX IF NOT EXISTS idx_partners_category ON public.partners(category);
CREATE INDEX IF NOT EXISTS idx_partners_is_public ON public.partners(is_public);
CREATE INDEX IF NOT EXISTS idx_partners_slug ON public.partners(slug);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. RLS POLICIES FOR PARTNERS
-- ============================================

-- Policy: Anyone can view public partners (for search)
CREATE POLICY "Anyone can view public partners"
    ON public.partners FOR SELECT
    USING (is_public = true);

-- Policy: Partners can view/edit their own profile
CREATE POLICY "Partners can view own profile"
    ON public.partners FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Partners can update own profile"
    ON public.partners FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- ============================================
-- 3. PUBLIC SERVICES VIEW
-- ============================================
-- Allow anonymous users to see services of public partners

CREATE POLICY "Anyone can view services of public partners"
    ON public.services FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.partners 
            WHERE partners.id = services.partner_id 
            AND partners.is_public = true
        )
    );

-- ============================================
-- 4. HELPER FUNCTION: Generate Slug
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase, replace spaces and special chars
    base_slug := lower(regexp_replace(name, '[^a-zA-Z0-9]', '-', 'g'));
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    final_slug := base_slug;
    
    -- Check for uniqueness
    WHILE EXISTS (SELECT 1 FROM public.partners WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. TRIGGER: Auto-create partner on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.partners (id, company_name, phone, email, slug)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'company_name', 'İşletme'),
        NEW.raw_user_meta_data->>'phone',
        NEW.email,
        public.generate_slug(COALESCE(NEW.raw_user_meta_data->>'company_name', 'isletme'))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger (drop first if exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 6. CATEGORIES LIST (for filters)
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(10),
    sort_order INTEGER DEFAULT 0
);

-- Insert default categories
INSERT INTO public.categories (name, icon, sort_order) VALUES
    ('Kuaför & Güzellik', '💇', 1),
    ('Sağlık & Klinik', '🏥', 2),
    ('Spor & Fitness', '🏋️', 3),
    ('Spa & Masaj', '💆', 4),
    ('Eğitim & Kurs', '📚', 5),
    ('Restoran & Kafe', '🍽️', 6),
    ('Otel & Konaklama', '🏨', 7),
    ('Araç Servisi', '🚗', 8),
    ('Diğer', '📋', 99)
ON CONFLICT (name) DO NOTHING;

-- Public read for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories"
    ON public.categories FOR SELECT
    USING (true);

-- ============================================
-- 7. CITIES LIST (for filters)
-- ============================================
CREATE TABLE IF NOT EXISTS public.cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    country VARCHAR(100) DEFAULT 'Türkiye'
);

-- Insert major Turkish cities
INSERT INTO public.cities (name) VALUES
    ('İstanbul'),
    ('Ankara'),
    ('İzmir'),
    ('Bursa'),
    ('Antalya'),
    ('Adana'),
    ('Konya'),
    ('Gaziantep'),
    ('Mersin'),
    ('Kayseri'),
    ('Eskişehir'),
    ('Samsun'),
    ('Trabzon'),
    ('Diyarbakır'),
    ('Denizli')
ON CONFLICT (name) DO NOTHING;

-- Public read for cities
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cities"
    ON public.cities FOR SELECT
    USING (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- SELECT * FROM public.categories ORDER BY sort_order;
-- SELECT * FROM public.cities ORDER BY name;
-- SELECT * FROM public.partners WHERE is_public = true;
