// Real market quotes (no broker, no credentials).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { getQuote, normalizeSymbol } from "../_shared/quotes.ts";

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
    symbols = symbols.map(normalizeSymbol).filter((s) => s.length >= 6 && s.length <= 12).slice(0, 20);
    if (symbols.length === 0) return json({ error: "Provide at least one symbol" }, 400);

    const results = await Promise.all(symbols.map(async (s) => [s, await getQuote(s)] as const));
    const quotes: Record<string, number | null> = {};
    for (const [s, p] of results) quotes[s] = p;
    return json({ quotes, at: new Date().toISOString() });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
