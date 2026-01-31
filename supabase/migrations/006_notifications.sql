-- In-App Notifications System
-- Real-time notifications within the web app

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'appointment_new', 'appointment_confirmed', 'appointment_cancelled', 'appointment_reminder', 'review_new'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Additional data like appointment_id, partner_id, etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(user_id, created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update (mark as read) their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- System can insert notifications (via service role)
CREATE POLICY "Service can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Function to create notification
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

-- Trigger: Create notification when appointment status changes
CREATE OR REPLACE FUNCTION notify_appointment_status_change()
RETURNS TRIGGER AS $$
DECLARE
  partner_user_id UUID;
  customer_user_id UUID;
  customer_name TEXT;
  partner_name TEXT;
  service_name TEXT;
  appt_date TEXT;
  appt_time TEXT;
BEGIN
  -- Get partner user id
  SELECT id INTO partner_user_id FROM partners WHERE id = NEW.partner_id;
  
  -- Get customer auth user id
  SELECT c.auth_user_id, c.name INTO customer_user_id, customer_name
  FROM customers c WHERE c.id = NEW.customer_id;
  
  -- Get partner name
  SELECT company_name INTO partner_name FROM partners WHERE id = NEW.partner_id;
  
  -- Get service name
  SELECT name INTO service_name FROM services WHERE id = NEW.service_id;
  
  -- Format date/time
  appt_date := TO_CHAR(NEW.start_time, 'DD Mon');
  appt_time := TO_CHAR(NEW.start_time, 'HH24:MI');

  -- New appointment notification to partner
  IF TG_OP = 'INSERT' THEN
    PERFORM create_notification(
      partner_user_id,
      'appointment_new',
      'Yeni Randevu',
      customer_name || ' - ' || service_name || ' (' || appt_date || ' ' || appt_time || ')',
      jsonb_build_object('appointment_id', NEW.id)
    );
  END IF;

  -- Status change notifications
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    -- Confirmed - notify customer
    IF NEW.status = 'confirmed' AND customer_user_id IS NOT NULL THEN
      PERFORM create_notification(
        customer_user_id,
        'appointment_confirmed',
        'Randevu Onaylandı',
        partner_name || ' randevunuzu onayladı (' || appt_date || ' ' || appt_time || ')',
        jsonb_build_object('appointment_id', NEW.id)
      );
    END IF;
    
    -- Cancelled - notify customer
    IF NEW.status = 'cancelled' AND customer_user_id IS NOT NULL THEN
      PERFORM create_notification(
        customer_user_id,
        'appointment_cancelled',
        'Randevu İptal Edildi',
        partner_name || ' randevunuz iptal edildi',
        jsonb_build_object('appointment_id', NEW.id)
      );
    END IF;
    
    -- Cancelled by customer - notify partner
    IF NEW.status = 'cancelled' THEN
      PERFORM create_notification(
        partner_user_id,
        'appointment_cancelled',
        'Randevu İptali',
        customer_name || ' randevusunu iptal etti (' || appt_date || ')',
        jsonb_build_object('appointment_id', NEW.id)
      );
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
  EXECUTE FUNCTION notify_appointment_status_change();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
