-- =====================================================
-- ISHFLOW.AI - Businesses Table for Public Profiles
-- Migration: 003_businesses_table.sql
-- =====================================================

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE, -- URL-friendly identifier (e.g., "guzellik-salonu")
  description TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  category TEXT, -- e.g., 'kuafor', 'klinik', 'spor-salonu'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one business per partner (for now)
  CONSTRAINT unique_partner_business UNIQUE (partner_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_businesses_partner_id ON businesses(partner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_is_active ON businesses(is_active);

-- =====================================================
-- RLS Policies for Public Access
-- =====================================================

-- Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can SELECT active businesses
CREATE POLICY "Public can view active businesses"
  ON businesses
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Policy 2: Partners can manage their own business
CREATE POLICY "Partners can manage own business"
  ON businesses
  FOR ALL
  TO authenticated
  USING (auth.uid() = partner_id)
  WITH CHECK (auth.uid() = partner_id);

-- =====================================================
-- RLS Policy for Services (Public Read)
-- =====================================================

-- Add public read policy for services if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'services' 
    AND policyname = 'Public can view active services'
  ) THEN
    CREATE POLICY "Public can view active services"
      ON services
      FOR SELECT
      TO anon, authenticated
      USING (is_active = true);
  END IF;
END $$;

-- =====================================================
-- Function to auto-generate slug from name
-- =====================================================

CREATE OR REPLACE FUNCTION generate_business_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INT := 0;
BEGIN
  -- Generate base slug from name (Turkish char support)
  base_slug := LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
          REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            NEW.name,
            'ş', 's'), 'ğ', 'g'), 'ü', 'u'), 'ı', 'i'), 'ö', 'o'), 'ç', 'c'),
            'Ş', 's'), 'Ğ', 'g'), 'Ü', 'u'), 'İ', 'i'), 'Ö', 'o'), 'Ç', 'c'
        ),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
  
  -- Ensure unique slug
  new_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM businesses WHERE slug = new_slug AND id != NEW.id) LOOP
    counter := counter + 1;
    new_slug := base_slug || '-' || counter;
  END LOOP;
  
  NEW.slug := new_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto slug generation
DROP TRIGGER IF EXISTS trigger_generate_business_slug ON businesses;
CREATE TRIGGER trigger_generate_business_slug
  BEFORE INSERT OR UPDATE OF name ON businesses
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION generate_business_slug();

-- =====================================================
-- Function to auto-create business on partner signup
-- (Optional - can be triggered from application code)
-- =====================================================

-- Comment: Consider creating businesses record when partner registers
-- This can be done in application code after successful signup

COMMENT ON TABLE businesses IS 'Public business profiles for partners';
