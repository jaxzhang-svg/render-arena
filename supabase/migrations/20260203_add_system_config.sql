-- Create system_config table for dynamic system configuration
CREATE TABLE IF NOT EXISTS public.system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT
);

-- Enable RLS (only admins can modify)
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read config
CREATE POLICY "Anyone can read system config"
  ON public.system_config FOR SELECT
  USING (true);

-- Only service role can modify (no direct user updates)
-- Updates should be done via API with proper authentication

-- Insert initial configuration
INSERT INTO public.system_config (key, value, description) VALUES
  ('free_tier_disabled', 'false', 'When true, disables free tier for anonymous and authenticated non-paid users'),
  ('all_generation_disabled', 'false', 'When true, disables ALL generation for everyone including paid users'),
  ('novita_balance_threshold', '99900', 'Balance threshold in Novita units (1 unit = 0.0001 USD). 99900 units = 9.99 USD. When balance falls below this, free tier will be disabled'),
  ('last_balance_check', '', 'Last checked Novita account balance in integer units (1 unit = 0.0001 USD)'),
  ('last_balance_check_time', '', 'Timestamp of last balance check')
ON CONFLICT (key) DO NOTHING;

-- Create function to update config (can be called from API)
CREATE OR REPLACE FUNCTION update_system_config(
  p_key TEXT,
  p_value TEXT,
  p_updated_by TEXT DEFAULT 'system'
)
RETURNS void AS $$
BEGIN
  UPDATE public.system_config
  SET 
    value = p_value,
    updated_at = NOW(),
    updated_by = p_updated_by
  WHERE key = p_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.system_config IS 'Dynamic system configuration that can be updated at runtime';
COMMENT ON FUNCTION update_system_config IS 'Update a system config value. Should be called from authenticated API endpoints.';
