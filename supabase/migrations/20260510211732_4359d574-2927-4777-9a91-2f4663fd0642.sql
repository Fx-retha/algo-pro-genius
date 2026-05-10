
-- Extensions for scheduling
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- MT accounts
create table public.mt_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  label text not null default 'My MT Account',
  meta_account_id text not null,
  broker text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.mt_accounts enable row level security;
create policy "users view own mt_accounts" on public.mt_accounts for select using (auth.uid() = user_id);
create policy "users insert own mt_accounts" on public.mt_accounts for insert with check (auth.uid() = user_id);
create policy "users update own mt_accounts" on public.mt_accounts for update using (auth.uid() = user_id);
create policy "users delete own mt_accounts" on public.mt_accounts for delete using (auth.uid() = user_id);
create policy "admins view all mt_accounts" on public.mt_accounts for select using (has_role(auth.uid(), 'admin'));

-- Signals (chart scans / AI calls)
create table public.signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  symbol text not null,
  direction text not null check (direction in ('buy','sell','neutral')),
  confidence numeric not null default 0,
  entry text,
  stop_loss text,
  take_profit text,
  summary text,
  source text not null default 'chart_scanner',
  auto_executed boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.signals enable row level security;
create policy "users view own signals" on public.signals for select using (auth.uid() = user_id);
create policy "users insert own signals" on public.signals for insert with check (auth.uid() = user_id);
create policy "users delete own signals" on public.signals for delete using (auth.uid() = user_id);
create policy "admins view all signals" on public.signals for select using (has_role(auth.uid(), 'admin'));

-- Trades
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  mt_account_id uuid references public.mt_accounts(id) on delete set null,
  signal_id uuid references public.signals(id) on delete set null,
  symbol text not null,
  side text not null check (side in ('buy','sell')),
  volume numeric not null,
  entry_price numeric,
  stop_loss numeric,
  take_profit numeric,
  status text not null default 'pending',
  meta_order_id text,
  meta_position_id text,
  profit numeric,
  error_message text,
  opened_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.trades enable row level security;
create policy "users view own trades" on public.trades for select using (auth.uid() = user_id);
create policy "users insert own trades" on public.trades for insert with check (auth.uid() = user_id);
create policy "users update own trades" on public.trades for update using (auth.uid() = user_id);
create policy "admins view all trades" on public.trades for select using (has_role(auth.uid(), 'admin'));

-- Bot configs (one per user)
create table public.bot_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  mt_account_id uuid references public.mt_accounts(id) on delete set null,
  enabled boolean not null default false,
  symbols text[] not null default array['EURUSD','GBPUSD','XAUUSD'],
  min_confidence numeric not null default 70,
  volume numeric not null default 0.01,
  max_open_trades integer not null default 3,
  last_run_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.bot_configs enable row level security;
create policy "users manage own bot_config" on public.bot_configs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "admins view all bot_configs" on public.bot_configs for select using (has_role(auth.uid(), 'admin'));

-- updated_at triggers
create trigger trg_mt_accounts_updated before update on public.mt_accounts for each row execute function public.update_updated_at_column();
create trigger trg_trades_updated before update on public.trades for each row execute function public.update_updated_at_column();
create trigger trg_bot_configs_updated before update on public.bot_configs for each row execute function public.update_updated_at_column();

-- Indexes
create index idx_trades_user on public.trades(user_id, created_at desc);
create index idx_signals_user on public.signals(user_id, created_at desc);
create index idx_mt_accounts_user on public.mt_accounts(user_id);
