import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const METAAPI_TOKEN = Deno.env.get("METAAPI_TOKEN");
    if (!METAAPI_TOKEN) {
      return new Response(JSON.stringify({ error: "MetaAPI token not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, accountId, symbol, volume, stopLoss, takeProfit, actionType } = await req.json();

    const baseUrl = "https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai";

    // Route based on action
    switch (action) {
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
        const { positionId } = await req.json();
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
