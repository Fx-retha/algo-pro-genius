ALTER TABLE public.mt_accounts
  ADD COLUMN IF NOT EXISTS platform text NOT NULL DEFAULT 'mt5',
  ADD COLUMN IF NOT EXISTS login text,
  ADD COLUMN IF NOT EXISTS connection_status text NOT NULL DEFAULT 'disconnected',
  ADD COLUMN IF NOT EXISTS robot_status text NOT NULL DEFAULT 'stopped',
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_error text;

ALTER TABLE public.mt_accounts
  DROP CONSTRAINT IF EXISTS mt_accounts_platform_check,
  DROP CONSTRAINT IF EXISTS mt_accounts_connection_status_check,
  DROP CONSTRAINT IF EXISTS mt_accounts_robot_status_check;

ALTER TABLE public.mt_accounts
  ADD CONSTRAINT mt_accounts_platform_check CHECK (platform IN ('mt4','mt5')),
  ADD CONSTRAINT mt_accounts_connection_status_check CHECK (connection_status IN ('disconnected','deploying','connected','error')),
  ADD CONSTRAINT mt_accounts_robot_status_check CHECK (robot_status IN ('stopped','running','error'));

CREATE INDEX IF NOT EXISTS mt_accounts_user_active_idx ON public.mt_accounts (user_id, is_active);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt_accounts TO authenticated;
GRANT ALL ON public.mt_accounts TO service_role;