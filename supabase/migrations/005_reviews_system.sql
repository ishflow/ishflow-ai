-- Reviews System
-- Customers can leave reviews after completed appointments

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One review per appointment
  UNIQUE(appointment_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_partner ON reviews(partner_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(partner_id, rating);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view visible reviews
CREATE POLICY "Anyone can view visible reviews" ON reviews
  FOR SELECT USING (is_visible = true);

-- Customers can create reviews for their completed appointments
CREATE POLICY "Customers can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = customer_id AND
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_id
      AND a.status = 'completed'
      AND EXISTS (
        SELECT 1 FROM customers c
        WHERE c.id = a.customer_id
        AND c.auth_user_id = auth.uid()
      )
    )
  );

-- Customers can update their own reviews
CREATE POLICY "Customers can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = customer_id);

-- Partners can hide reviews (moderation)
CREATE POLICY "Partners can moderate reviews" ON reviews
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM partners p
      WHERE p.id = partner_id
      AND p.id = auth.uid()
    )
  );

-- Function to calculate partner average rating
CREATE OR REPLACE FUNCTION get_partner_rating(p_id UUID)
RETURNS TABLE (
  average_rating NUMERIC,
  review_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(rating)::numeric, 1) as average_rating,
    COUNT(*) as review_count
  FROM reviews
  WHERE partner_id = p_id AND is_visible = true;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update partner stats when review is added
CREATE OR REPLACE FUNCTION update_partner_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE partners
  SET 
    average_rating = (
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM reviews
      WHERE partner_id = NEW.partner_id AND is_visible = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE partner_id = NEW.partner_id AND is_visible = true
    )
  WHERE id = NEW.partner_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add rating columns to partners if not exists
ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(2,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- Create trigger
DROP TRIGGER IF EXISTS update_partner_rating_trigger ON reviews;
CREATE TRIGGER update_partner_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_rating();
