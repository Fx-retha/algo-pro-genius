-- Paper (demo) trading accounts
CREATE TABLE public.paper_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'Demo Account',
  currency text NOT NULL DEFAULT 'USD',
  starting_balance numeric NOT NULL DEFAULT 10000,
  balance numeric NOT NULL DEFAULT 10000,
  equity numeric NOT NULL DEFAULT 10000,
  leverage integer NOT NULL DEFAULT 100,
  max_open_trades integer NOT NULL DEFAULT 5,
  max_volume numeric NOT NULL DEFAULT 5,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paper_accounts TO authenticated;
GRANT ALL ON public.paper_accounts TO service_role;
ALTER TABLE public.paper_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own paper accounts" ON public.paper_accounts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_paper_accounts_updated BEFORE UPDATE ON public.paper_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Paper positions / orders
CREATE TABLE public.paper_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id uuid NOT NULL REFERENCES public.paper_accounts(id) ON DELETE CASCADE,
  signal_id uuid REFERENCES public.signals(id),
  symbol text NOT NULL,
  side text NOT NULL,
  volume numeric NOT NULL,
  open_price numeric NOT NULL,
  close_price numeric,
  stop_loss numeric,
  take_profit numeric,
  status text NOT NULL DEFAULT 'open',
  profit numeric NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'manual',
  execution_mode text NOT NULL DEFAULT 'demo',
  bridge_status text,
  note text,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paper_positions TO authenticated;
GRANT ALL ON public.paper_positions TO service_role;
ALTER TABLE public.paper_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own paper positions" ON public.paper_positions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_paper_positions_user_status ON public.paper_positions (user_id, status);
CREATE TRIGGER trg_paper_positions_updated BEFORE UPDATE ON public.paper_positions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Python MT5 bridge connections (token hashed, no broker credentials stored)
CREATE TABLE public.bridge_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'My Windows PC',
  token_hash text NOT NULL,
  token_prefix text NOT NULL,
  status text NOT NULL DEFAULT 'offline',
  platform text NOT NULL DEFAULT 'mt5',
  account_login text,
  balance numeric,
  equity numeric,
  last_seen_at timestamptz,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bridge_connections TO authenticated;
GRANT ALL ON public.bridge_connections TO service_role;
ALTER TABLE public.bridge_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users manage own bridges" ON public.bridge_connections
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE UNIQUE INDEX idx_bridge_token_hash ON public.bridge_connections (token_hash);
CREATE TRIGGER trg_bridge_connections_updated BEFORE UPDATE ON public.bridge_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chart scan history (server-side, cross device)
CREATE TABLE public.scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  direction text NOT NULL DEFAULT 'neutral',
  confidence numeric NOT NULL DEFAULT 0,
  entry text,
  stop_loss text,
  take_profit text,
  summary text,
  rejected_reason text,
  live_price numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.scan_history TO authenticated;
GRANT ALL ON public.scan_history TO service_role;
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own scans" ON public.scan_history
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own scans" ON public.scan_history
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own scans" ON public.scan_history
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_scan_history_user_created ON public.scan_history (user_id, created_at DESC);

-- Economic calendar cache (public read)
CREATE TABLE public.economic_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL,
  event_time timestamptz NOT NULL,
  country text,
  currency text,
  title text NOT NULL,
  impact text NOT NULL DEFAULT 'low',
  actual text,
  forecast text,
  previous text,
  source text NOT NULL DEFAULT 'nfs',
  fetched_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.economic_events TO anon, authenticated;
GRANT ALL ON public.economic_events TO service_role;
ALTER TABLE public.economic_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read economic events" ON public.economic_events
  FOR SELECT TO anon, authenticated USING (true);
CREATE UNIQUE INDEX idx_economic_events_external ON public.economic_events (external_id);
CREATE INDEX idx_economic_events_time ON public.economic_events (event_time);