// Create / rotate / delete a user's MT5 bridge. Token is shown once and stored hashed.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

async function sha256(v: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return "cb_" + [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
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
    const action = String(body.action ?? "status");

    if (action === "status") {
      const { data } = await admin.from("bridge_connections")
        .select("id,label,status,platform,account_login,balance,equity,last_seen_at,last_error,token_prefix,created_at")
        .eq("user_id", user.id).order("created_at", { ascending: true });
      return json({ bridges: data ?? [] });
    }

    if (action === "create" || action === "rotate") {
      const token = newToken();
      const hash = await sha256(token);
      const prefix = token.slice(0, 10);
      if (action === "rotate") {
        const id = String(body.bridge_id ?? "");
        const { data: owned } = await admin.from("bridge_connections").select("id")
          .eq("id", id).eq("user_id", user.id).maybeSingle();
        if (!owned) return json({ error: "Bridge not found" }, 404);
        await admin.from("bridge_connections")
          .update({ token_hash: hash, token_prefix: prefix, status: "offline", last_error: null }).eq("id", id);
        return json({ success: true, token });
      }
      const label = String(body.label ?? "My Windows PC").slice(0, 60);
      const { data, error } = await admin.from("bridge_connections")
        .insert({ user_id: user.id, label, token_hash: hash, token_prefix: prefix })
        .select("id,label").maybeSingle();
      if (error) return json({ error: error.message }, 500);
      return json({ success: true, token, bridge: data });
    }

    if (action === "delete") {
      const id = String(body.bridge_id ?? "");
      await admin.from("bridge_connections").delete().eq("id", id).eq("user_id", user.id);
      return json({ success: true });
    }

    return json({ error: `Unknown action: ${action}` }, 400);
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
