import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const METAAPI_TOKEN = Deno.env.get("METAAPI_TOKEN");
    if (!METAAPI_TOKEN) {
      return json({ error: "MetaAPI token not configured. Add your MetaAPI API token in settings." });
    }
    // Real MetaAPI tokens are JWTs (three dot-separated parts, very long)
    if (METAAPI_TOKEN.split(".").length !== 3) {
      return json({
        error:
          "The saved MetaAPI token is not a valid API token. Copy the long JWT token from MetaAPI → API access tokens (it starts with 'eyJ' and has two dots), not the account ID.",
      });
    }

    const body = await req.json();
    const { action, accountId, symbol, volume, stopLoss, takeProfit, actionType } = body;

    const baseUrl = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";
    const provisioningUrl = "https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai";

    if (action === "verify_token") {
      const res = await fetch(`${provisioningUrl}/users/current/accounts`, {
        headers: { "auth-token": METAAPI_TOKEN },
      });
      const data = await res.json().catch(() => ({}));
      return json(res.ok ? { ok: true, accounts: Array.isArray(data) ? data.length : 0 } : { error: data.message || "Token rejected by MetaAPI" });
    }

    if (action !== "provision_account" && action !== "list_accounts" && !accountId) {
      return json({ error: "accountId is required for this action" });
    }


    // Route based on action
    switch (action) {
      // Create (provision) a MetaAPI account from broker login/password/server.
      // Works with any MT4/MT5 broker, incl. Razor Markets and other SA brokers.
      case "provision_account": {
        const { login, password, server, platform, name, region } = body;
        if (!login || !password || !server) {
          return new Response(JSON.stringify({ error: "login, password and server are required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
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
          return new Response(JSON.stringify({ error: created.message || "Failed to create MetaAPI account", details: created }), {
            status: createRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Deploy so it can trade (ignore errors — may already be deploying)
        await fetch(`${provisioningUrl}/users/current/accounts/${created.id}/deploy`, {
          method: "POST",
          headers: { "auth-token": METAAPI_TOKEN },
        }).catch(() => null);

        return new Response(JSON.stringify({ accountId: created.id, state: "DEPLOYING" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "remove_account": {
        await fetch(`${provisioningUrl}/users/current/accounts/${accountId}/undeploy`, {
          method: "POST", headers: { "auth-token": METAAPI_TOKEN },
        }).catch(() => null);
        const res = await fetch(`${provisioningUrl}/users/current/accounts/${accountId}`, {
          method: "DELETE", headers: { "auth-token": METAAPI_TOKEN },
        });
        return new Response(JSON.stringify({ ok: res.ok }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      case "get_account_info": {
        const res = await fetch(`https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts/${accountId}`, {
          headers: { "auth-token": METAAPI_TOKEN },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to get account info");
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_positions": {
        const res = await fetch(`${baseUrl}/users/current/accounts/${accountId}/positions`, {
          headers: { "auth-token": METAAPI_TOKEN },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to get positions");
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_account_metrics": {
        const res = await fetch(`${baseUrl}/users/current/accounts/${accountId}/account-information`, {
          headers: { "auth-token": METAAPI_TOKEN },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to get metrics");
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "place_trade": {
        if (!symbol || !volume || !actionType) {
          return new Response(JSON.stringify({ error: "Missing required trade parameters: symbol, volume, actionType" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const tradeBody: Record<string, unknown> = {
          actionType, // ORDER_TYPE_BUY or ORDER_TYPE_SELL
          symbol,
          volume: parseFloat(volume),
        };
        if (stopLoss) tradeBody.stopLoss = parseFloat(stopLoss);
        if (takeProfit) tradeBody.takeProfit = parseFloat(takeProfit);

        const res = await fetch(`${baseUrl}/users/current/accounts/${accountId}/trade`, {
          method: "POST",
          headers: {
            "auth-token": METAAPI_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tradeBody),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to place trade");
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "close_position": {
        const positionId = body.positionId;
        const res = await fetch(`${baseUrl}/users/current/accounts/${accountId}/trade`, {
          method: "POST",
          headers: {
            "auth-token": METAAPI_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            actionType: "POSITION_CLOSE_ID",
            positionId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to close position");
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "get_symbol_price": {
        if (!symbol) {
          return new Response(JSON.stringify({ error: "symbol required" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const res = await fetch(`${baseUrl}/users/current/accounts/${accountId}/symbols/${encodeURIComponent(symbol)}/current-price`, {
          headers: { "auth-token": METAAPI_TOKEN },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to get symbol price");
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "list_accounts": {
        const res = await fetch("https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/accounts", {
          headers: { "auth-token": METAAPI_TOKEN },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to list accounts");
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (e) {
    console.error("MetaAPI error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
