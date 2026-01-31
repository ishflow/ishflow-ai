-- Enable pg_net extension for HTTP calls from database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to call send-email Edge Function
CREATE OR REPLACE FUNCTION process_email_queue()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url TEXT := 'https://iretaddtpfxyplrkieux.supabase.co/functions/v1/send-email';
  service_role_key TEXT;
BEGIN
  -- Get service role key from vault (if set) or use anon key
  -- For now, we'll call without auth since the function can validate internally
  
  -- Call the Edge Function
  PERFORM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'id', NEW.id,
      'to_email', NEW.to_email,
      'template', NEW.template,
      'data', NEW.data
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to process emails immediately when added to queue
DROP TRIGGER IF EXISTS process_email_trigger ON email_queue;
CREATE TRIGGER process_email_trigger
  AFTER INSERT ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION process_email_queue();
