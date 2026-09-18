// Real market quotes (no broker, no credentials). Source: Stooq free CSV feed.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const cache = new Map<string, { price: number; at: number }>();
const TTL_MS = 15_000;

function normalize(symbol: string) {
  return symbol.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function quote(symbol: string): Promise<number | null> {
  const s = normalize(symbol);
  const hit = cache.get(s);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.price;

  const url = `https://stooq.com/q/l/?s=${s.toLowerCase()}&f=sd2t2ohlcv&h&e=csv`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    const text = await res.text();
    const rows = text.trim().split("\n");
    if (rows.length < 2) return null;
    const cols = rows[1].split(",");
    const close = Number(cols[6]);
    if (!Number.isFinite(close) || close <= 0) return null;
    cache.set(s, { price: close, at: Date.now() });
    return close;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const url = new URL(req.url);
    let symbols: string[] = [];
    if (req.method === "GET") {
      symbols = (url.searchParams.get("symbols") ?? "").split(",").filter(Boolean);
    } else {
      const body = await req.json().catch(() => ({}));
      const raw = body.symbols ?? body.symbol;
      symbols = Array.isArray(raw) ? raw : raw ? [raw] : [];
    }
    symbols = symbols.map(normalize).filter((s) => s.length >= 3 && s.length <= 12).slice(0, 20);
    if (symbols.length === 0) return json({ error: "Provide at least one symbol" }, 400);

    const results = await Promise.all(symbols.map(async (s) => [s, await quote(s)] as const));
    const quotes: Record<string, number | null> = {};
    for (const [s, p] of results) quotes[s] = p;
    return json({ quotes, at: new Date().toISOString() });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
