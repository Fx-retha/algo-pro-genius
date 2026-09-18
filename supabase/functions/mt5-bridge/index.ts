// Python MT5 bridge endpoint. Authenticated by a per-user bridge token (hashed at rest).
// The bridge runs on the user's own Windows PC — no broker login or password is ever sent here.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function sha256(v: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = await req.json().catch(() => ({}));
    const token = String(req.headers.get("x-bridge-token") ?? body.token ?? "");
    if (token.length < 20) return json({ error: "Missing bridge token" }, 401);

    const { data: bridge } = await admin.from("bridge_connections").select("*")
      .eq("token_hash", await sha256(token)).maybeSingle();
    if (!bridge) return json({ error: "Invalid bridge token" }, 401);

    const action = String(body.action ?? "heartbeat");
    const now = new Date().toISOString();

    if (action === "heartbeat") {
      await admin.from("bridge_connections").update({
        status: "online", last_seen_at: now,
        account_login: body.account_login ? String(body.account_login).slice(0, 32) : bridge.account_login,
        balance: Number.isFinite(Number(body.balance)) ? Number(body.balance) : bridge.balance,
        equity: Number.isFinite(Number(body.equity)) ? Number(body.equity) : bridge.equity,
        last_error: body.error ? String(body.error).slice(0, 500) : null,
      }).eq("id", bridge.id);
      return json({ success: true, server_time: now });
    }

    if (action === "pull_orders") {
      const { data } = await admin.from("paper_positions")
        .select("id,symbol,side,volume,open_price,stop_loss,take_profit")
        .eq("user_id", bridge.user_id).eq("execution_mode", "bridge").eq("bridge_status", "pending")
        .order("opened_at", { ascending: true }).limit(20);
      const ids = (data ?? []).map((d) => d.id);
      if (ids.length) await admin.from("paper_positions").update({ bridge_status: "sent" }).in("id", ids);
      await admin.from("bridge_connections").update({ status: "online", last_seen_at: now }).eq("id", bridge.id);
      return json({ orders: data ?? [] });
    }

    if (action === "report_fill") {
      const id = String(body.position_id ?? "");
      const { data: pos } = await admin.from("paper_positions").select("id,user_id")
        .eq("id", id).eq("user_id", bridge.user_id).maybeSingle();
      if (!pos) return json({ error: "Order not found" }, 404);
      const filled = body.status === "failed" ? "failed" : "filled";
      await admin.from("paper_positions").update({
        bridge_status: filled,
        open_price: Number.isFinite(Number(body.fill_price)) ? Number(body.fill_price) : undefined,
        note: body.message ? String(body.message).slice(0, 300) : null,
        status: filled === "failed" ? "closed" : "open",
      }).eq("id", id);
      return json({ success: true });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
