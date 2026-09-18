// Real economic calendar. Source: FairEconomy (ForexFactory) weekly JSON feed. Cached in the DB.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const FEEDS = [
  "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
  "https://nfs.faireconomy.media/ff_calendar_nextweek.json",
];

interface FFEvent {
  title: string; country: string; date: string; impact: string;
  forecast?: string; previous?: string; actual?: string;
}

function impactOf(v: string) {
  const s = (v ?? "").toLowerCase();
  if (s.startsWith("high")) return "high";
  if (s.startsWith("med")) return "medium";
  if (s.startsWith("holiday")) return "holiday";
  return "low";
}

async function refresh() {
  const rows: Record<string, unknown>[] = [];
  for (const url of FEEDS) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 12_000);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "CodeBase/1.0" } });
      if (!res.ok) continue;
      const data = (await res.json()) as FFEvent[];
      for (const e of data) {
        const when = new Date(e.date);
        if (Number.isNaN(when.getTime())) continue;
        rows.push({
          external_id: `${e.country}|${e.title}|${when.toISOString()}`,
          event_time: when.toISOString(),
          country: e.country,
          currency: e.country,
          title: e.title,
          impact: impactOf(e.impact),
          actual: e.actual || null,
          forecast: e.forecast || null,
          previous: e.previous || null,
          source: "faireconomy",
          fetched_at: new Date().toISOString(),
        });
      }
    } catch { /* skip feed */ } finally { clearTimeout(t); }
  }
  if (rows.length === 0) return { upserted: 0 };
  const { error } = await supabase.from("economic_events").upsert(rows, { onConflict: "external_id" });
  if (error) throw new Error(error.message);
  return { upserted: rows.length };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const url = new URL(req.url);
    const body = req.method === "GET" ? {} : await req.json().catch(() => ({}));
    const action = String(url.searchParams.get("action") ?? body.action ?? "list");

    if (action === "refresh") return json({ success: true, ...(await refresh()) });

    // list: ensure cache is fresh (older than 30 min → refresh)
    const { data: newest } = await supabase
      .from("economic_events").select("fetched_at").order("fetched_at", { ascending: false }).limit(1).maybeSingle();
    const stale = !newest || Date.now() - new Date(newest.fetched_at as string).getTime() > 30 * 60 * 1000;
    if (stale) { try { await refresh(); } catch { /* serve cache */ } }

    const from = new Date(Date.now() - 12 * 3600 * 1000).toISOString();
    const to = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();
    const { data, error } = await supabase
      .from("economic_events")
      .select("id,event_time,country,currency,title,impact,actual,forecast,previous")
      .gte("event_time", from).lte("event_time", to)
      .order("event_time", { ascending: true }).limit(500);
    if (error) return json({ error: error.message }, 500);
    return json({ events: data ?? [], refreshed: stale });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
