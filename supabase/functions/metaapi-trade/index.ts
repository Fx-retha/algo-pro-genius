import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Always answer 200 with an { error } payload so the client can show the real reason
  const json = (payload: unknown, status = 200) =>
    new Response(JSON.stringify(payload), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    // ---- Require an authenticated user ----
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return json({ error: "Unauthorized" }, 401);
    const user = userData.user;

    const METAAPI_TOKEN = Deno.env.get("METAAPI_TOKEN");
    if (!METAAPI_TOKEN) {
      return json({ error: "MetaAPI token not configured. Add your MetaAPI API token in settings." });
    }
    const tokenHint =
      METAAPI_TOKEN.split(".").length !== 3
        ? " (The saved MetaAPI token doesn't look like an API token — copy the long token from MetaAPI → API access tokens, it starts with 'eyJ'.)"
        : "";

    const body = await req.json().catch(() => ({}));
    const { action, accountId, symbol, volume, stopLoss, takeProfit, actionType } = body ?? {};

    if (typeof action !== "string") return json({ error: "action is required" }, 400);

    const baseUrl = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";
    const provisioningUrl = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";

    // Diagnostic: check whether the configured MetaAPI token is accepted.
    if (action === "verify_token") {
      const res = await fetch(`${provisioningUrl}/users/current/accounts`, {
        headers: { "auth-token": METAAPI_TOKEN },
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        return json({
          ok: false,
          status: res.status,
          error: ((payload as any)?.message || "MetaAPI rejected the token") + tokenHint,
        });
      }
      return json({ ok: true, accounts: Array.isArray(payload) ? payload.length : 0 });
    }

    // ---- Ownership enforcement for every action that targets an account ----
    if (action !== "provision_account") {
      if (!accountId || typeof accountId !== "string") {
        return json({ error: "accountId is required for this action" }, 400);
      }
      const { data: owned } = await supabase
        .from("mt_accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("meta_account_id", accountId)
        .maybeSingle();
      if (!owned) return json({ error: "You do not have access to this trading account" }, 403);
    }


    switch (action) {
      // Create (provision) a MetaAPI account from broker login/password/server.
      case "provision_account": {
        const { login, password, server, platform, name, region } = body;
        if (!login || !password || !server) {
          return json({ error: "login, password and server are required" }, 400);
        }

        const createRes = await fetch(`${provisioningUrl}/users/current/accounts`, {
          method: "POST",
          headers: { "auth-token": METAAPI_TOKEN, "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name || `Code Base ${login}`,
            type: "cloud-g2",
            login: String(login),
            password: String(password),
            server: String(server),
            platform: platform === "mt4" ? "mt4" : "mt5",
            magic: 202608,
            region: region || "london",
            reliability: "regular",
          }),
        });
        const created = await createRes.json();
        if (!createRes.ok) {
          console.error("provision failed", created);
          return json({ error: (created.message || "Failed to create MetaAPI account") + tokenHint });
        }

        await fetch(`${provisioningUrl}/users/current/accounts/${created.id}/deploy`, {
          method: "POST",
          headers: { "auth-token": METAAPI_TOKEN },
        }).catch(() => null);

        return json({ accountId: created.id, state: "DEPLOYING" });
      }

      case "remove_account": {
        await fetch(`${provisioningUrl}/users/current/accounts/${accountId}/undeploy`, {
          method: "POST", headers: { "auth-token": METAAPI_TOKEN },
        }).catch(() => null);
        const res = await fetch(`${provisioningUrl}/users/current/accounts/${accountId}`, {
          method: "DELETE", headers: { "auth-token": METAAPI_TOKEN },
        });
        return json({ ok: res.ok });
      }

      case "get_account_info": {
        const res = await fetch(`${provisioningUrl}/users/current/accounts/${accountId}`, {
          headers: { "auth-token": METAAPI_TOKEN },
        });
        const data = await res.json();
        if (!res.ok) return json({ error: data.message || "Failed to get account info" });
        return json(data);
      }

      case "get_positions": {
        const res = await fetch(`${baseUrl}/users/current/accounts/${accountId}/positions`, {
          headers: { "auth-token": METAAPI_TOKEN },
        });
        const data = await res.json();
        if (!res.ok) return json({ error: data.message || "Failed to get positions" });
        return json(data);
      }

      case "get_account_metrics": {
        const res = await fetch(`${baseUrl}/users/current/accounts/${accountId}/account-information`, {
          headers: { "auth-token": METAAPI_TOKEN },
        });
        const data = await res.json();
        if (!res.ok) return json({ error: data.message || "Failed to get metrics" });
        return json(data);
      }

      case "place_trade": {
        if (!symbol || !volume || !actionType) {
          return json({ error: "Missing required trade parameters: symbol, volume, actionType" }, 400);
        }
        if (typeof symbol !== "string" || !/^[A-Za-z0-9/._-]{1,20}$/.test(symbol)) {
          return json({ error: "Invalid symbol" }, 400);
        }
        if (actionType !== "ORDER_TYPE_BUY" && actionType !== "ORDER_TYPE_SELL") {
          return json({ error: "Invalid actionType" }, 400);
        }
        const vol = parseFloat(String(volume));
        if (!Number.isFinite(vol) || vol <= 0 || vol > 100) {
          return json({ error: "Invalid volume" }, 400);
        }

        const tradeBody: Record<string, unknown> = { actionType, symbol, volume: vol };
        const sl = stopLoss !== undefined && stopLoss !== null ? parseFloat(String(stopLoss)) : NaN;
        const tp = takeProfit !== undefined && takeProfit !== null ? parseFloat(String(takeProfit)) : NaN;
        if (Number.isFinite(sl)) tradeBody.stopLoss = sl;
        if (Number.isFinite(tp)) tradeBody.takeProfit = tp;

        const res = await fetch(`${baseUrl}/users/current/accounts/${accountId}/trade`, {
          method: "POST",
          headers: { "auth-token": METAAPI_TOKEN, "Content-Type": "application/json" },
          body: JSON.stringify(tradeBody),
        });
        const data = await res.json();
        if (!res.ok) return json({ error: data.message || "Failed to place trade" });
        return json(data);
      }

      case "close_position": {
        const positionId = body.positionId;
        if (!positionId || typeof positionId !== "string") {
          return json({ error: "positionId is required" }, 400);
        }
        const res = await fetch(`${baseUrl}/users/current/accounts/${accountId}/trade`, {
          method: "POST",
          headers: { "auth-token": METAAPI_TOKEN, "Content-Type": "application/json" },
          body: JSON.stringify({ actionType: "POSITION_CLOSE_ID", positionId }),
        });
        const data = await res.json();
        if (!res.ok) return json({ error: data.message || "Failed to close position" });
        return json(data);
      }

      case "get_symbol_price": {
        if (!symbol || typeof symbol !== "string" || !/^[A-Za-z0-9/._-]{1,20}$/.test(symbol)) {
          return json({ error: "Invalid symbol" }, 400);
        }
        const res = await fetch(`${baseUrl}/users/current/accounts/${accountId}/symbols/${encodeURIComponent(symbol)}/current-price`, {
          headers: { "auth-token": METAAPI_TOKEN },
        });
        const data = await res.json();
        if (!res.ok) return json({ error: data.message || "Failed to get symbol price" });
        return json(data);
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (e) {
    console.error("MetaAPI error:", e);
    return json({ error: "Request failed" });
  }
});
