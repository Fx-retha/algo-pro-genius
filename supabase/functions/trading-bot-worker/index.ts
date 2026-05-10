// Auto-trading worker. Runs on a schedule (cron) or on-demand.
// For each user with bot_configs.enabled=true, fetches an AI signal per symbol,
// places trades on MetaAPI when confidence >= threshold, and logs everything.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const METAAPI_TOKEN = Deno.env.get("METAAPI_TOKEN") ?? "";
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";

const META_BASE = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";

interface BotConfig {
  id: string;
  user_id: string;
  mt_account_id: string | null;
  enabled: boolean;
  symbols: string[];
  min_confidence: number;
  volume: number;
  max_open_trades: number;
}

async function getAiSignal(symbol: string, price: number) {
  if (!LOVABLE_API_KEY) {
    return { direction: "neutral", confidence: 0, summary: "No AI key" };
  }
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "You are a forex/commodity trading signal generator. Return strict JSON: {direction:'buy'|'sell'|'neutral', confidence:0-100, summary:string, stop_loss:number, take_profit:number}. Use the live price and reasonable risk/reward (1:2)." },
        { role: "user", content: `Symbol: ${symbol}\nLive price: ${price}\nGive me a trading signal now.` },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) return { direction: "neutral", confidence: 0, summary: `AI ${res.status}` };
  const data = await res.json();
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch {
    return { direction: "neutral", confidence: 0, summary: "Parse error" };
  }
}

async function getPrice(accountId: string, symbol: string) {
  const r = await fetch(`${META_BASE}/users/current/accounts/${accountId}/symbols/${encodeURIComponent(symbol)}/current-price`, {
    headers: { "auth-token": METAAPI_TOKEN },
  });
  if (!r.ok) return null;
  const d = await r.json();
  const bid = Number(d.bid ?? 0), ask = Number(d.ask ?? 0);
  return (bid + ask) / 2 || bid || ask || null;
}

async function placeTrade(accountId: string, body: Record<string, unknown>) {
  const r = await fetch(`${META_BASE}/users/current/accounts/${accountId}/trade`, {
    method: "POST",
    headers: { "auth-token": METAAPI_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  return { ok: r.ok, data: d };
}

async function getOpenPositions(accountId: string) {
  const r = await fetch(`${META_BASE}/users/current/accounts/${accountId}/positions`, {
    headers: { "auth-token": METAAPI_TOKEN },
  });
  if (!r.ok) return [];
  return await r.json();
}

async function processConfig(supabase: any, cfg: BotConfig) {
  const summary = { user: cfg.user_id, processed: 0, executed: 0, errors: [] as string[] };

  // Resolve MT account
  let metaAccountId: string | null = null;
  if (cfg.mt_account_id) {
    const { data } = await supabase.from("mt_accounts").select("meta_account_id").eq("id", cfg.mt_account_id).maybeSingle();
    metaAccountId = data?.meta_account_id ?? null;
  } else {
    const { data } = await supabase.from("mt_accounts").select("meta_account_id").eq("user_id", cfg.user_id).eq("is_active", true).limit(1).maybeSingle();
    metaAccountId = data?.meta_account_id ?? null;
  }
  if (!metaAccountId) {
    summary.errors.push("No MT account");
    return summary;
  }

  // Respect max open trades
  const positions = METAAPI_TOKEN ? await getOpenPositions(metaAccountId) : [];
  const openCount = Array.isArray(positions) ? positions.length : 0;
  if (openCount >= cfg.max_open_trades) {
    summary.errors.push(`Max open (${openCount}) reached`);
    return summary;
  }

  let remaining = cfg.max_open_trades - openCount;

  for (const symbol of cfg.symbols) {
    if (remaining <= 0) break;
    summary.processed++;
    try {
      const price = METAAPI_TOKEN ? await getPrice(metaAccountId, symbol) : 1.0;
      if (!price) { summary.errors.push(`${symbol}: no price`); continue; }

      const signal = await getAiSignal(symbol, price);
      const direction = String(signal.direction || "neutral").toLowerCase();
      const confidence = Number(signal.confidence ?? 0);

      // Log signal
      const { data: signalRow } = await supabase.from("signals").insert({
        user_id: cfg.user_id, symbol, direction,
        confidence, entry: String(price),
        stop_loss: signal.stop_loss ? String(signal.stop_loss) : null,
        take_profit: signal.take_profit ? String(signal.take_profit) : null,
        summary: signal.summary || "", source: "auto_bot",
      }).select("id").maybeSingle();

      if (direction === "neutral" || confidence < cfg.min_confidence) continue;
      if (!METAAPI_TOKEN) { summary.errors.push("METAAPI_TOKEN not set"); continue; }

      const tradeRes = await placeTrade(metaAccountId, {
        actionType: direction === "buy" ? "ORDER_TYPE_BUY" : "ORDER_TYPE_SELL",
        symbol,
        volume: cfg.volume,
        ...(signal.stop_loss ? { stopLoss: Number(signal.stop_loss) } : {}),
        ...(signal.take_profit ? { takeProfit: Number(signal.take_profit) } : {}),
      });

      await supabase.from("trades").insert({
        user_id: cfg.user_id,
        mt_account_id: cfg.mt_account_id,
        signal_id: signalRow?.id,
        symbol, side: direction, volume: cfg.volume,
        entry_price: price,
        stop_loss: signal.stop_loss ?? null,
        take_profit: signal.take_profit ?? null,
        status: tradeRes.ok ? "opened" : "failed",
        meta_order_id: tradeRes.data?.orderId ?? null,
        meta_position_id: tradeRes.data?.positionId ?? null,
        error_message: tradeRes.ok ? null : (tradeRes.data?.message || "Trade failed"),
        opened_at: tradeRes.ok ? new Date().toISOString() : null,
      });

      if (tradeRes.ok) {
        summary.executed++;
        remaining--;
        if (signalRow?.id) await supabase.from("signals").update({ auto_executed: true }).eq("id", signalRow.id);
      } else {
        summary.errors.push(`${symbol}: ${tradeRes.data?.message || "trade failed"}`);
      }
    } catch (e) {
      summary.errors.push(`${symbol}: ${(e as Error).message}`);
    }
  }

  await supabase.from("bot_configs").update({ last_run_at: new Date().toISOString() }).eq("id", cfg.id);
  return summary;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Optional: target a single user (manual trigger from app)
    let targetUserId: string | null = null;
    if (req.method === "POST") {
      try { const b = await req.json(); targetUserId = b?.userId ?? null; } catch { /* ignore */ }
    }

    let q = supabase.from("bot_configs").select("*").eq("enabled", true);
    if (targetUserId) q = q.eq("user_id", targetUserId);
    const { data: configs, error } = await q;
    if (error) throw error;

    const results = [];
    for (const cfg of (configs ?? [])) {
      results.push(await processConfig(supabase, cfg as BotConfig));
    }

    return new Response(JSON.stringify({ ok: true, count: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("worker error", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
