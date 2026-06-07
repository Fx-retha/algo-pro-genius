// Code Base Trading API — ported from PHP `trading_api_ea_nexus.php` + `activate_email_device.php`.
// Single edge function that routes by ?endpoint= or JSON { endpoint } to match the original PHP shape,
// so MT4/MT5 EAs and the mobile client can keep their existing request structure.
//
// Call examples:
//   POST  /functions/v1/code-base-api?endpoint=validate_license   { license_key, device_id }
//   POST  /functions/v1/code-base-api?endpoint=trading_activity   { license_key, symbol, side, volume, ... }
//   GET   /functions/v1/code-base-api?endpoint=get_signals&license_key=XXXX
//
// Backed by Supabase tables already in this project.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-device-id",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const APP_NAME = "Code Base";
const APP_VERSION = "2.0.0";

// ---------- helpers ----------
function ok(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify({ success: true, ...data }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
function err(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return new Response(JSON.stringify({ success: false, error: message, ...extra }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

interface ReqCtx {
  endpoint: string;
  params: Record<string, string>;
  body: Record<string, unknown>;
  deviceId: string;
}

function pick(ctx: ReqCtx, ...names: string[]): string {
  for (const n of names) {
    const v = (ctx.params[n] ?? ctx.body[n]) as string | undefined;
    if (v !== undefined && v !== null && String(v).length > 0) return String(v);
  }
  return "";
}

// ---------- endpoints ----------

// validate_license  → looks up public.license_keys
async function validateLicense(ctx: ReqCtx) {
  const licenseKey = pick(ctx, "license_key", "licenseKey").toUpperCase();
  if (!licenseKey) return err("Missing license key", 400);

  const { data, error } = await supabase
    .from("license_keys")
    .select("id,key,status,plan,user_id,activated_at,expires_at")
    .eq("key", licenseKey)
    .maybeSingle();
  if (error) return err(error.message, 500);
  if (!data) return err("Invalid license key", 401);
  if (data.status !== "active") return err(`License is ${data.status}`, 403);
  if (data.expires_at && new Date(data.expires_at) < new Date())
    return err("License has expired", 403);

  // Resolve linked profile (used for mentor_username + user_name compatibility)
  let userName = "User";
  let userEmail = "";
  if (data.user_id) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("full_name,email,mentor_id")
      .eq("user_id", data.user_id)
      .maybeSingle();
    if (prof) {
      userName = prof.full_name ?? prof.email ?? "User";
      userEmail = prof.email ?? "";
    }
  }

  return ok({
    valid: true,
    license_id: data.id,
    license_key: data.key,
    plan: data.plan,
    status: data.status,
    expiry_date: data.expires_at,
    requires_subscription: false,
    subscription_active: true,
    license_type: "perpetual",
    product_name: APP_NAME,
    platform: "MT5",
    user_name: userName,
    user_email: userEmail,
    mentor_username: null,
    app_name: APP_NAME,
    app_version: APP_VERSION,
  });
}

// register_instance — accept and acknowledge (no instances table in current schema)
async function registerInstance(ctx: ReqCtx) {
  const licenseKey = pick(ctx, "license_key", "licenseKey").toUpperCase();
  if (!licenseKey) return err("Missing license key", 400);
  return ok({
    instance_id: crypto.randomUUID(),
    registered_at: new Date().toISOString(),
    message: "Instance registered",
  });
}

async function instanceStatus(_ctx: ReqCtx) {
  return ok({ status: "active", server_time: new Date().toISOString() });
}

// trading_activity — log to public.trades
async function tradingActivity(ctx: ReqCtx) {
  const licenseKey = pick(ctx, "license_key", "licenseKey").toUpperCase();
  if (!licenseKey) return err("Missing license key", 400);

  const { data: lic } = await supabase
    .from("license_keys").select("user_id,status").eq("key", licenseKey).maybeSingle();
  if (!lic || lic.status !== "active") return err("Invalid or inactive license", 401);
  if (!lic.user_id) return err("License not yet assigned to a user", 403);

  const symbol = pick(ctx, "symbol");
  const side = (pick(ctx, "side", "type", "action") || "buy").toLowerCase();
  const volume = Number(pick(ctx, "volume", "lots") || 0.01);
  const entry = Number(pick(ctx, "entry_price", "price") || 0) || null;
  const sl = Number(pick(ctx, "stop_loss", "sl") || 0) || null;
  const tp = Number(pick(ctx, "take_profit", "tp") || 0) || null;
  const profit = Number(pick(ctx, "profit") || 0) || null;
  const status = pick(ctx, "status") || "opened";
  const metaOrderId = pick(ctx, "order_id", "meta_order_id") || null;
  const metaPositionId = pick(ctx, "position_id", "meta_position_id") || null;

  if (!symbol) return err("Missing symbol", 400);

  const { data: row, error } = await supabase.from("trades").insert({
    user_id: lic.user_id,
    symbol, side, volume,
    entry_price: entry,
    stop_loss: sl, take_profit: tp,
    status, profit,
    meta_order_id: metaOrderId, meta_position_id: metaPositionId,
    opened_at: status === "opened" ? new Date().toISOString() : null,
    closed_at: status === "closed" ? new Date().toISOString() : null,
  }).select("id").maybeSingle();
  if (error) return err(error.message, 500);

  return ok({ trade_id: row?.id, logged_at: new Date().toISOString() });
}

// get_signals — return latest signals for the license owner
async function getSignals(ctx: ReqCtx) {
  const licenseKey = pick(ctx, "license_key", "licenseKey").toUpperCase();
  if (!licenseKey) return err("Missing license key", 400);

  const { data: lic } = await supabase
    .from("license_keys").select("user_id,status").eq("key", licenseKey).maybeSingle();
  if (!lic || lic.status !== "active") return err("Invalid or inactive license", 401);
  if (!lic.user_id) return ok({ signals: [] });

  const limit = Number(pick(ctx, "limit") || 25);
  const symbol = pick(ctx, "symbol");

  let q = supabase
    .from("signals")
    .select("id,symbol,direction,confidence,entry,stop_loss,take_profit,summary,created_at,auto_executed,source")
    .eq("user_id", lic.user_id)
    .order("created_at", { ascending: false })
    .limit(Math.min(limit, 100));
  if (symbol) q = q.eq("symbol", symbol);

  const { data, error } = await q;
  if (error) return err(error.message, 500);
  return ok({ signals: data ?? [] });
}

// get_symbols — return user's configured symbols (bot_configs)
async function getSymbols(ctx: ReqCtx) {
  const licenseKey = pick(ctx, "license_key", "licenseKey").toUpperCase();
  if (!licenseKey) {
    // No license → return default basket
    return ok({ symbols: ["EURUSD", "GBPUSD", "XAUUSD", "USDJPY", "BTCUSD"].map(name => ({ name })) });
  }
  const { data: lic } = await supabase
    .from("license_keys").select("user_id").eq("key", licenseKey).maybeSingle();
  if (!lic?.user_id) {
    return ok({ symbols: ["EURUSD", "GBPUSD", "XAUUSD"].map(name => ({ name })) });
  }
  const { data: cfg } = await supabase
    .from("bot_configs").select("symbols").eq("user_id", lic.user_id).maybeSingle();
  const list = (cfg?.symbols as string[] | null) ?? ["EURUSD", "GBPUSD", "XAUUSD"];
  return ok({ symbols: list.map((name) => ({ name })) });
}

// get_product_images — branding only (no ea_products table)
async function getProductImages(_ctx: ReqCtx) {
  return ok({
    product_id: 1,
    product_name: APP_NAME,
    product_description: "Code Base Algo Pro — AI-powered MT5 trading suite.",
    platform: "MT5",
    main_image: null, image: null, logo: null, video: null,
  });
}

// check_app_version
async function checkAppVersion(_ctx: ReqCtx) {
  return ok({
    current_version: APP_VERSION,
    min_required_version: "1.0.0",
    update_required: false,
    update_url: "https://algo-pro-genius.lovable.app",
    release_notes: `${APP_NAME} ${APP_VERSION}`,
  });
}

// activate_email_device — bridges activate_email_device.php; maps email→profile→license
async function activateEmailDevice(ctx: ReqCtx) {
  const email = pick(ctx, "email").toLowerCase();
  const deviceId = pick(ctx, "device_id") || ctx.deviceId;
  if (!email) return err("Email is required", 400);
  if (!deviceId) return err("Device ID is required", 400);

  const { data: prof } = await supabase
    .from("profiles").select("user_id,email").eq("email", email).maybeSingle();
  if (!prof) return err("Email not registered. Please register first.", 404);

  const { data: lic } = await supabase
    .from("license_keys")
    .select("id,status,expires_at")
    .eq("user_id", prof.user_id)
    .eq("status", "active")
    .maybeSingle();
  if (!lic) return err("No active subscription on this email.", 403);

  const expiry = lic.expires_at ? new Date(lic.expires_at) : null;
  const days = expiry ? Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / 86400000)) : 365;

  return ok({
    devicesUsed: 1,
    subscriptionDays: days,
    message: `Device activated successfully! ${days} days subscription granted.`,
  });
}

// ---------- router ----------
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const params: Record<string, string> = {};
    url.searchParams.forEach((v, k) => (params[k] = v));

    let body: Record<string, unknown> = {};
    if (req.method !== "GET") {
      const ct = req.headers.get("content-type") ?? "";
      try {
        if (ct.includes("application/json")) body = await req.json();
        else if (ct.includes("form")) {
          const fd = await req.formData();
          fd.forEach((v, k) => (body[k] = String(v)));
        }
      } catch { /* ignore */ }
    }

    const endpoint = String(params.endpoint ?? body.endpoint ?? url.pathname.split("/").pop() ?? "");
    const ctx: ReqCtx = {
      endpoint, params, body,
      deviceId: req.headers.get("x-device-id") ?? "",
    };

    switch (endpoint) {
      case "validate_license":     return await validateLicense(ctx);
      case "register_instance":    return await registerInstance(ctx);
      case "instance_status":      return await instanceStatus(ctx);
      case "trading_activity":     return await tradingActivity(ctx);
      case "get_signals":          return await getSignals(ctx);
      case "get_symbols":          return await getSymbols(ctx);
      case "get_product_images":   return await getProductImages(ctx);
      case "check_app_version":    return await checkAppVersion(ctx);
      case "activate_email_device":return await activateEmailDevice(ctx);
      case "":                     return ok({ app: APP_NAME, version: APP_VERSION, endpoints: [
        "validate_license","register_instance","instance_status","trading_activity",
        "get_signals","get_symbols","get_product_images","check_app_version","activate_email_device",
      ]});
      default: return err(`Unknown endpoint: ${endpoint}`, 400);
    }
  } catch (e) {
    console.error("code-base-api error", e);
    return err((e as Error).message ?? "Internal server error", 500);
  }
});
