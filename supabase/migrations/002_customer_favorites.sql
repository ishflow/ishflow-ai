-- Customer Favorites Table
-- Allows customers to save their favorite businesses

CREATE TABLE IF NOT EXISTS customer_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate favorites
  UNIQUE(customer_id, partner_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customer_favorites_customer ON customer_favorites(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_partner ON customer_favorites(partner_id);

-- Row Level Security
ALTER TABLE customer_favorites ENABLE ROW LEVEL SECURITY;

-- Customers can view their own favorites
CREATE POLICY "Customers can view own favorites" ON customer_favorites
  FOR SELECT USING (auth.uid() = customer_id);

-- Customers can add to their own favorites
CREATE POLICY "Customers can add favorites" ON customer_favorites
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Customers can remove from their own favorites
CREATE POLICY "Customers can remove favorites" ON customer_favorites
  FOR DELETE USING (auth.uid() = customer_id);
