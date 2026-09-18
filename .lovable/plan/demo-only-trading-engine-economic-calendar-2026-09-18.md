# Demo-only trading engine + economic calendar

## What already exists (inspection, nothing changed)

**Accounts and sign-in**
- Email/password sign-in, password reset, and Google-style redirect handling.
- Automatic profile creation on sign-up, with a generated mentor ID.
- Two roles (admin, user) kept in a separate roles table, so a user cannot promote themselves.

**Database (8 tables, all with row-level access rules)**
- profiles, user_roles, license_keys, mentor_applications
- mt_accounts (linked trading accounts, connection and robot status)
- signals (AI chart signals), trades (order records), bot_configs (symbols, confidence, lot size, max open trades)

**Licensing**
- Admin-only key generation, activation by the user, revoke/expiry handling, and a 500-key capacity rule already in the database.

**Server functions (6)**
- analyze-trade — AI chart analysis, sign-in required
- metaapi-trade — live broker calls (the piece you want to retire)
- trading-bot-worker — scheduled bot that creates signals and places trades
- trading-voice-chat — voice assistant
- code-base-api — endpoints for the MT4/MT5 expert advisor
- mcp — agent integrations

**What is missing**
- No demo/paper trading engine: every execution path assumes a live broker.
- No price feed independent of the broker connection, so nothing works without it.
- No place for your Windows MT5 bridge to check in, receive orders, or report fills.
- No scan history stored in the backend (currently browser-only).
- No economic calendar anywhere in the app.

## What I will build

### 1. Demo-only trading engine (no broker, no passwords)
- New "paper accounts" record per user: starting balance, currency, equity, free margin, all simulated.
- New paper positions and orders: open, modify stop/target, close, with profit recalculated from live prices.
- Every order passes server-side checks: lot size limits, balance check, valid stop/target distances, maximum open trades.
- A running equity curve and closed-trade history per account.
- The dashboard, chart scanner and auto-trader switch to this engine, so the app is fully usable with zero broker credentials.

### 2. Real market prices without a broker
- A server function pulls live quotes for forex, metals and crypto from a public market data source and caches them briefly.
- Used for demo fills, floating profit, and the scanner's price validation.

### 3. Future Python MT5 bridge (prepared, not required)
- Each user can create a named bridge with a rotating token they copy into their Windows script. No broker password or login ever leaves their PC or enters the app.
- Bridge endpoints: heartbeat/status, pull pending orders, report fills and account state.
- Orders stay in "pending bridge" until the bridge confirms; if no bridge is connected, the demo engine fills them instead.
- I will include a ready-to-run Python script template for your PC.

### 4. Economic calendar (real data)
- New Calendar page and dashboard card: today and the coming week, with time, country, event, impact level, actual/forecast/previous.
- Data fetched server-side from a public economic calendar feed, cached in the database and refreshed on a schedule so the app stays fast.
- Filters by impact and currency; high-impact events near a scanned pair show a warning in the scanner.

### 5. Safety and cleanup
- MetaAPI calls are disabled behind a clearly labelled "live trading unavailable" state instead of failing silently. No secrets are requested or displayed.
- Demo mode is labelled throughout so no one mistakes it for real money.

## Technical notes
- New tables: paper_accounts, paper_positions, paper_orders, bridge_connections, economic_events, scan_history — each with explicit grants and owner-only access rules; bridge tokens stored hashed.
- New functions: paper-trade (open/close/modify/settle), market-data (quotes), mt5-bridge (token-authenticated, service-role writes), economic-calendar (fetch + cache, scheduled).
- Existing signal, trade and bot tables are reused; no destructive migrations.

## Verification
- Open, modify and close demo trades; confirm balance, equity and profit maths.
- Confirm rejected orders for oversized lots, insufficient balance, and bad stop levels.
- Confirm one user cannot touch another's demo account or bridge.
- Confirm calendar shows real upcoming events with correct times in local timezone.
