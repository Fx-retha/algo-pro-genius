// Demo-only trading engine. No broker, no credentials. All validation server-side.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_KEY);

const quoteCache = new Map<string, { price: number; at: number }>();
async function quote(symbol: string): Promise<number | null> {
  const s = symbol.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const hit = quoteCache.get(s);
  if (hit && Date.now() - hit.at < 15_000) return hit.price;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`https://stooq.com/q/l/?s=${s.toLowerCase()}&f=sd2t2ohlcv&h&e=csv`, { signal: ctrl.signal });
    if (!res.ok) return null;
    const rows = (await res.text()).trim().split("\n");
    if (rows.length < 2) return null;
    const close = Number(rows[1].split(",")[6]);
    if (!Number.isFinite(close) || close <= 0) return null;
    quoteCache.set(s, { price: close, at: Date.now() });
    return close;
  } catch { return null; } finally { clearTimeout(t); }
}

// Approximate contract value per 1.0 lot, used for demo P/L only.
function contractSize(symbol: string) {
  const s = symbol.toUpperCase();
  if (s.startsWith("XAU")) return 100;
  if (s.startsWith("XAG")) return 5000;
  if (s.startsWith("BTC") || s.startsWith("ETH")) return 1;
  return 100_000;
}
function pnl(side: string, volume: number, open: number, current: number, symbol: string) {
  const dir = side === "buy" ? 1 : -1;
  return +(dir * (current - open) * volume * contractSize(symbol)).toFixed(2);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Not authenticated" }, 401);
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: auth } = await userClient.auth.getUser();
    const user = auth?.user;
    if (!user) return json({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    // Ensure a demo account exists
    async function getAccount() {
      const { data } = await admin.from("paper_accounts").select("*").eq("user_id", user.id).eq("is_active", true)
        .order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (data) return data;
      const { data: created, error } = await admin.from("paper_accounts")
        .insert({ user_id: user.id }).select("*").maybeSingle();
      if (error) throw new Error(error.message);
      return created!;
    }

    async function settle(accountId: string) {
      const { data: open } = await admin.from("paper_positions")
        .select("*").eq("user_id", user.id).eq("account_id", accountId).eq("status", "open");
      const positions = open ?? [];
      const prices = new Map<string, number>();
      await Promise.all([...new Set(positions.map((p) => p.symbol as string))].map(async (s) => {
        const p = await quote(s); if (p) prices.set(s, p);
      }));

      let floating = 0;
      for (const p of positions) {
        const price = prices.get(p.symbol as string);
        if (!price) continue;
        let profit = pnl(p.side as string, Number(p.volume), Number(p.open_price), price, p.symbol as string);
        const hitSL = p.stop_loss && (p.side === "buy" ? price <= Number(p.stop_loss) : price >= Number(p.stop_loss));
        const hitTP = p.take_profit && (p.side === "buy" ? price >= Number(p.take_profit) : price <= Number(p.take_profit));
        if (hitSL || hitTP) {
          const closeAt = Number(hitSL ? p.stop_loss : p.take_profit);
          profit = pnl(p.side as string, Number(p.volume), Number(p.open_price), closeAt, p.symbol as string);
          await admin.from("paper_positions").update({
            status: "closed", close_price: closeAt, profit, closed_at: new Date().toISOString(),
            note: hitSL ? "Stop loss hit" : "Take profit hit",
          }).eq("id", p.id);
          const { data: acc } = await admin.from("paper_accounts").select("balance").eq("id", accountId).maybeSingle();
          await admin.from("paper_accounts").update({ balance: Number(acc?.balance ?? 0) + profit }).eq("id", accountId);
        } else {
          (p as Record<string, unknown>).current_price = price;
          (p as Record<string, unknown>).profit = profit;
          await admin.from("paper_positions").update({ profit }).eq("id", p.id);
          floating += profit;
        }
      }
      const { data: acc } = await admin.from("paper_accounts").select("*").eq("id", accountId).maybeSingle();
      const equity = +(Number(acc!.balance) + floating).toFixed(2);
      await admin.from("paper_accounts").update({ equity }).eq("id", accountId);
      return { account: { ...acc!, equity }, floating: +floating.toFixed(2) };
    }

    if (action === "get_state") {
      const account = await getAccount();
      const { account: acc, floating } = await settle(account.id as string);
      const { data: open } = await admin.from("paper_positions").select("*")
        .eq("account_id", account.id).eq("status", "open").order("opened_at", { ascending: false });
      const { data: closed } = await admin.from("paper_positions").select("*")
        .eq("account_id", account.id).eq("status", "closed").order("closed_at", { ascending: false }).limit(50);
      return json({ account: acc, floating, open: open ?? [], closed: closed ?? [] });
    }

    if (action === "open_trade") {
      const symbol = String(body.symbol ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
      const side = String(body.side ?? "").toLowerCase();
      const volume = Number(body.volume);
      const stopLoss = body.stop_loss != null ? Number(body.stop_loss) : null;
      const takeProfit = body.take_profit != null ? Number(body.take_profit) : null;

      if (symbol.length < 3 || symbol.length > 12) return json({ error: "Invalid symbol" }, 400);
      if (side !== "buy" && side !== "sell") return json({ error: "Side must be buy or sell" }, 400);
      if (!Number.isFinite(volume) || volume <= 0) return json({ error: "Invalid lot size" }, 400);

      const account = await getAccount();
      if (volume > Number(account.max_volume)) return json({ error: `Lot size above the ${account.max_volume} limit` }, 400);

      const { count } = await admin.from("paper_positions").select("id", { count: "exact", head: true })
        .eq("account_id", account.id).eq("status", "open");
      if ((count ?? 0) >= Number(account.max_open_trades))
        return json({ error: `Maximum of ${account.max_open_trades} open demo trades reached` }, 400);

      const price = await quote(symbol);
      if (!price) return json({ error: `No live price available for ${symbol}` }, 400);

      if (stopLoss != null) {
        if (!Number.isFinite(stopLoss) || stopLoss <= 0) return json({ error: "Invalid stop loss" }, 400);
        if (side === "buy" ? stopLoss >= price : stopLoss <= price)
          return json({ error: "Stop loss is on the wrong side of the price" }, 400);
      }
      if (takeProfit != null) {
        if (!Number.isFinite(takeProfit) || takeProfit <= 0) return json({ error: "Invalid take profit" }, 400);
        if (side === "buy" ? takeProfit <= price : takeProfit >= price)
          return json({ error: "Take profit is on the wrong side of the price" }, 400);
      }

      const margin = (price * volume * contractSize(symbol)) / Number(account.leverage);
      if (margin > Number(account.equity)) return json({ error: "Not enough demo balance for this lot size" }, 400);

      // If a bridge is online, mark it for the Windows MT5 script to pick up; otherwise fill in demo.
      const { data: bridge } = await admin.from("bridge_connections").select("id,status,last_seen_at")
        .eq("user_id", user.id).eq("status", "online").maybeSingle();
      const bridgeOnline = bridge && bridge.last_seen_at &&
        Date.now() - new Date(bridge.last_seen_at as string).getTime() < 120_000;

      const { data: pos, error } = await admin.from("paper_positions").insert({
        user_id: user.id, account_id: account.id, symbol, side, volume,
        open_price: price, stop_loss: stopLoss, take_profit: takeProfit,
        signal_id: body.signal_id ?? null,
        source: String(body.source ?? "manual"),
        execution_mode: bridgeOnline ? "bridge" : "demo",
        bridge_status: bridgeOnline ? "pending" : null,
        status: "open",
      }).select("*").maybeSingle();
      if (error) return json({ error: error.message }, 500);
      return json({ success: true, position: pos, mode: bridgeOnline ? "bridge" : "demo" });
    }

    if (action === "close_trade") {
      const id = String(body.position_id ?? "");
      const { data: pos } = await admin.from("paper_positions").select("*")
        .eq("id", id).eq("user_id", user.id).maybeSingle();
      if (!pos) return json({ error: "Trade not found" }, 404);
      if (pos.status !== "open") return json({ error: "Trade already closed" }, 400);
      const price = await quote(pos.symbol as string);
      if (!price) return json({ error: "No live price available to close" }, 400);
      const profit = pnl(pos.side as string, Number(pos.volume), Number(pos.open_price), price, pos.symbol as string);
      await admin.from("paper_positions").update({
        status: "closed", close_price: price, profit, closed_at: new Date().toISOString(), note: "Closed manually",
      }).eq("id", id);
      const { data: acc } = await admin.from("paper_accounts").select("balance").eq("id", pos.account_id).maybeSingle();
      await admin.from("paper_accounts").update({ balance: +(Number(acc?.balance ?? 0) + profit).toFixed(2) })
        .eq("id", pos.account_id);
      await settle(pos.account_id as string);
      return json({ success: true, profit });
    }

    if (action === "modify_trade") {
      const id = String(body.position_id ?? "");
      const { data: pos } = await admin.from("paper_positions").select("*")
        .eq("id", id).eq("user_id", user.id).eq("status", "open").maybeSingle();
      if (!pos) return json({ error: "Open trade not found" }, 404);
      const price = await quote(pos.symbol as string);
      if (!price) return json({ error: "No live price available" }, 400);
      const sl = body.stop_loss != null ? Number(body.stop_loss) : null;
      const tp = body.take_profit != null ? Number(body.take_profit) : null;
      if (sl != null && (pos.side === "buy" ? sl >= price : sl <= price))
        return json({ error: "Stop loss is on the wrong side of the price" }, 400);
      if (tp != null && (pos.side === "buy" ? tp <= price : tp >= price))
        return json({ error: "Take profit is on the wrong side of the price" }, 400);
      await admin.from("paper_positions").update({ stop_loss: sl, take_profit: tp }).eq("id", id);
      return json({ success: true });
    }

    if (action === "reset_account") {
      const account = await getAccount();
      await admin.from("paper_positions").update({
        status: "closed", closed_at: new Date().toISOString(), note: "Account reset",
      }).eq("account_id", account.id).eq("status", "open");
      await admin.from("paper_accounts").update({
        balance: account.starting_balance, equity: account.starting_balance,
      }).eq("id", account.id);
      return json({ success: true });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e) {
    console.error("paper-trade error", e);
    return json({ error: (e as Error).message }, 500);
  }
});
