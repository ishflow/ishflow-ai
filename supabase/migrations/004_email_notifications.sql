-- Email Notification Triggers
-- Automatically send emails when appointments change status

-- Function to call edge function for email
CREATE OR REPLACE FUNCTION notify_appointment_change()
RETURNS TRIGGER AS $$
DECLARE
  customer_email TEXT;
  customer_name TEXT;
  business_name TEXT;
  service_name TEXT;
  partner_address TEXT;
  partner_phone TEXT;
  appointment_date TEXT;
  appointment_time TEXT;
  notification_type TEXT;
BEGIN
  -- Get customer info
  SELECT 
    c.email, 
    c.name
  INTO customer_email, customer_name
  FROM customers c
  WHERE c.id = NEW.customer_id;

  -- Get business info
  SELECT 
    p.company_name,
    p.address,
    p.phone
  INTO business_name, partner_address, partner_phone
  FROM partners p
  WHERE p.id = NEW.partner_id;

  -- Get service info
  SELECT s.name INTO service_name
  FROM services s
  WHERE s.id = NEW.service_id;

  -- Format date and time
  appointment_date := TO_CHAR(NEW.start_time AT TIME ZONE 'Europe/Istanbul', 'DD Month YYYY');
  appointment_time := TO_CHAR(NEW.start_time AT TIME ZONE 'Europe/Istanbul', 'HH24:MI');

  -- Determine notification type
  IF TG_OP = 'INSERT' THEN
    notification_type := 'appointment_created';
  ELSIF NEW.status = 'confirmed' AND OLD.status = 'pending' THEN
    notification_type := 'appointment_confirmed';
  ELSIF NEW.status = 'cancelled' THEN
    notification_type := 'appointment_cancelled';
  ELSE
    RETURN NEW;
  END IF;

  -- Queue notification (using pg_net extension if available)
  -- Note: This requires pg_net extension or a cron job to process
  INSERT INTO notification_queue (
    type,
    channel,
    recipient,
    payload,
    created_at
  ) VALUES (
    notification_type,
    'email',
    customer_email,
    jsonb_build_object(
      'customerName', customer_name,
      'businessName', business_name,
      'serviceName', service_name,
      'date', appointment_date,
      'time', appointment_time,
      'address', partner_address,
      'phone', partner_phone,
      'price', (SELECT price FROM services WHERE id = NEW.service_id)
    ),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Notification queue table
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  channel TEXT NOT NULL, -- 'email', 'telegram', 'sms'
  recipient TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Index for processing queue
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status, created_at);

-- Trigger for new appointments
DROP TRIGGER IF EXISTS appointment_notification_trigger ON appointments;
CREATE TRIGGER appointment_notification_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION notify_appointment_change();

-- RLS for notification_queue (service role only)
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Only service role can access
CREATE POLICY "Service role only" ON notification_queue
  FOR ALL USING (false);
