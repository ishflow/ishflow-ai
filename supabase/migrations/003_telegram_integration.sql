-- Telegram Integration
-- Add telegram_chat_id to partners and create notification settings

-- Add telegram_chat_id to partners table
ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
ADD COLUMN IF NOT EXISTS telegram_notifications BOOLEAN DEFAULT true;

-- Create notification_settings table for granular control
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('partner', 'customer')),
  telegram_chat_id TEXT,
  notify_new_appointment BOOLEAN DEFAULT true,
  notify_appointment_confirmed BOOLEAN DEFAULT true,
  notify_appointment_cancelled BOOLEAN DEFAULT true,
  notify_appointment_reminder BOOLEAN DEFAULT true,
  reminder_hours_before INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_notification_settings_user ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_telegram ON notification_settings(telegram_chat_id);

-- RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Telegram verification tokens (for linking accounts)
CREATE TABLE IF NOT EXISTS telegram_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-delete expired verifications
CREATE INDEX IF NOT EXISTS idx_telegram_verifications_expires ON telegram_verifications(expires_at);

-- Function to clean expired verifications
CREATE OR REPLACE FUNCTION clean_expired_verifications()
RETURNS void AS $$
BEGIN
  DELETE FROM telegram_verifications WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
