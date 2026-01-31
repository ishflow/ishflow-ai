-- =============================================
-- ISHFLOW.AI - FULL MIGRATION
-- Tüm yeni özellikler için tek SQL dosyası
-- Supabase Dashboard > SQL Editor'da çalıştır
-- =============================================

-- =============================================
-- 1. CUSTOMER FAVORITES
-- =============================================

CREATE TABLE IF NOT EXISTS customer_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, partner_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_favorites_customer ON customer_favorites(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_favorites_partner ON customer_favorites(partner_id);

ALTER TABLE customer_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own favorites" ON customer_favorites;
CREATE POLICY "Customers can view own favorites" ON customer_favorites
  FOR SELECT USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can add favorites" ON customer_favorites;
CREATE POLICY "Customers can add favorites" ON customer_favorites
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can remove favorites" ON customer_favorites;
CREATE POLICY "Customers can remove favorites" ON customer_favorites
  FOR DELETE USING (auth.uid() = customer_id);

-- =============================================
-- 2. NOTIFICATIONS (In-App)
-- =============================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(user_id, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can insert notifications" ON notifications;
CREATE POLICY "Service can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- =============================================
-- 3. EMAIL NOTIFICATION QUEUE
-- =============================================

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  template TEXT NOT NULL,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, created_at);

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. REVIEWS SYSTEM
-- =============================================

-- Add rating columns to partners
ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS average_rating NUMERIC(2,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

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
  UNIQUE(appointment_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_partner ON reviews(partner_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view visible reviews" ON reviews;
CREATE POLICY "Anyone can view visible reviews" ON reviews
  FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Customers can create reviews" ON reviews;
CREATE POLICY "Customers can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can update own reviews" ON reviews;
CREATE POLICY "Customers can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = customer_id);

-- =============================================
-- 5. HELPER FUNCTIONS
-- =============================================

-- Function to create in-app notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO notification_id;
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to queue email
CREATE OR REPLACE FUNCTION queue_email(
  p_to_email TEXT,
  p_template TEXT,
  p_data JSONB
)
RETURNS UUID AS $$
DECLARE
  email_id UUID;
BEGIN
  INSERT INTO email_queue (to_email, template, data)
  VALUES (p_to_email, p_template, p_data)
  RETURNING id INTO email_id;
  RETURN email_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. APPOINTMENT NOTIFICATION TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION notify_appointment_change()
RETURNS TRIGGER AS $$
DECLARE
  partner_user_id UUID;
  customer_user_id UUID;
  customer_name TEXT;
  customer_email TEXT;
  partner_name TEXT;
  partner_email TEXT;
  service_name TEXT;
  service_price NUMERIC;
  appt_date TEXT;
  appt_time TEXT;
BEGIN
  -- Get partner info
  SELECT id, company_name, email INTO partner_user_id, partner_name, partner_email
  FROM partners WHERE id = NEW.partner_id;
  
  -- Get customer info
  SELECT c.auth_user_id, c.name, c.email INTO customer_user_id, customer_name, customer_email
  FROM customers c WHERE c.id = NEW.customer_id;
  
  -- Get service info
  SELECT name, price INTO service_name, service_price
  FROM services WHERE id = NEW.service_id;
  
  -- Format date/time (Turkish)
  appt_date := TO_CHAR(NEW.start_time AT TIME ZONE 'Europe/Istanbul', 'DD Mon YYYY');
  appt_time := TO_CHAR(NEW.start_time AT TIME ZONE 'Europe/Istanbul', 'HH24:MI');

  -- NEW APPOINTMENT
  IF TG_OP = 'INSERT' THEN
    -- In-app notification to partner
    PERFORM create_notification(
      partner_user_id,
      'appointment_new',
      'Yeni Randevu',
      customer_name || ' - ' || service_name || ' (' || appt_date || ' ' || appt_time || ')',
      jsonb_build_object('appointment_id', NEW.id)
    );
    
    -- Email to partner
    IF partner_email IS NOT NULL THEN
      PERFORM queue_email(
        partner_email,
        'appointment_new_partner',
        jsonb_build_object(
          'customerName', customer_name,
          'serviceName', service_name,
          'date', appt_date,
          'time', appt_time,
          'price', service_price
        )
      );
    END IF;
    
    -- Email to customer
    IF customer_email IS NOT NULL THEN
      PERFORM queue_email(
        customer_email,
        'appointment_created',
        jsonb_build_object(
          'customerName', customer_name,
          'businessName', partner_name,
          'serviceName', service_name,
          'date', appt_date,
          'time', appt_time,
          'price', service_price
        )
      );
    END IF;
  END IF;

  -- STATUS CHANGES
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- CONFIRMED
    IF NEW.status = 'confirmed' THEN
      -- In-app to customer
      IF customer_user_id IS NOT NULL THEN
        PERFORM create_notification(
          customer_user_id,
          'appointment_confirmed',
          'Randevu Onaylandı',
          partner_name || ' randevunuzu onayladı (' || appt_date || ' ' || appt_time || ')',
          jsonb_build_object('appointment_id', NEW.id)
        );
      END IF;
      
      -- Email to customer
      IF customer_email IS NOT NULL THEN
        PERFORM queue_email(
          customer_email,
          'appointment_confirmed',
          jsonb_build_object(
            'customerName', customer_name,
            'businessName', partner_name,
            'serviceName', service_name,
            'date', appt_date,
            'time', appt_time
          )
        );
      END IF;
    END IF;
    
    -- CANCELLED
    IF NEW.status = 'cancelled' THEN
      -- In-app to customer
      IF customer_user_id IS NOT NULL THEN
        PERFORM create_notification(
          customer_user_id,
          'appointment_cancelled',
          'Randevu İptal Edildi',
          partner_name || ' randevunuz iptal edildi',
          jsonb_build_object('appointment_id', NEW.id)
        );
      END IF;
      
      -- In-app to partner
      PERFORM create_notification(
        partner_user_id,
        'appointment_cancelled',
        'Randevu İptali',
        customer_name || ' randevusunu iptal etti (' || appt_date || ')',
        jsonb_build_object('appointment_id', NEW.id)
      );
      
      -- Email to customer
      IF customer_email IS NOT NULL THEN
        PERFORM queue_email(
          customer_email,
          'appointment_cancelled',
          jsonb_build_object(
            'customerName', customer_name,
            'businessName', partner_name,
            'serviceName', service_name,
            'date', appt_date,
            'time', appt_time
          )
        );
      END IF;
    END IF;
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS appointment_notification_trigger ON appointments;
CREATE TRIGGER appointment_notification_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_change();

-- =============================================
-- 7. UPDATE PARTNER RATING TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_partner_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE partners
  SET 
    average_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
      FROM reviews
      WHERE partner_id = COALESCE(NEW.partner_id, OLD.partner_id) AND is_visible = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE partner_id = COALESCE(NEW.partner_id, OLD.partner_id) AND is_visible = true
    )
  WHERE id = COALESCE(NEW.partner_id, OLD.partner_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_partner_rating_trigger ON reviews;
CREATE TRIGGER update_partner_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_rating();

-- =============================================
-- DONE! 🎉
-- =============================================
