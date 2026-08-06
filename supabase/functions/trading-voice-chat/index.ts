import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_MESSAGES = 30;
const MAX_CONTENT_CHARS = 4000;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const jsonRes = (payload: unknown, status: number) =>
    new Response(JSON.stringify(payload), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    // --- Require a real signed-in user (anon key alone is not enough) ---
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return jsonRes({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return jsonRes({ error: "Unauthorized" }, 401);

    // --- Validate input ---
    const body = await req.json().catch(() => null);
    const rawMessages = body && (body as any).messages;
    if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
      return jsonRes({ error: "messages must be a non-empty array" }, 400);
    }
    if (rawMessages.length > MAX_MESSAGES) {
      return jsonRes({ error: `Too many messages (max ${MAX_MESSAGES})` }, 400);
    }
    const messages = rawMessages.map((m: any) => {
      if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
        throw new Response("invalid", { status: 400 });
      }
      return { role: m.role, content: m.content.slice(0, MAX_CONTENT_CHARS) };
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return jsonRes({ error: "AI is not configured" }, 500);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert forex and crypto trading assistant called "Code Base AI". You help traders with:
- Market analysis and trade ideas
- Technical analysis (support/resistance, indicators, patterns)
- Risk management advice
- Explaining trading concepts
- Pair-specific insights (EUR/USD, GBP/USD, XAU/USD, BTC/USD, etc.)

Keep responses concise, actionable, and professional. Use trading terminology naturally. Never give financial advice - always frame as educational analysis.`,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return jsonRes({ error: "Rate limited, please try again later." }, 429);
      if (response.status === 402) return jsonRes({ error: "Credits exhausted. Please add funds." }, 402);
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return jsonRes({ error: "AI gateway error" }, 500);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    if (e instanceof Response) return jsonRes({ error: "Invalid message format" }, 400);
    console.error("chat error:", e);
    return jsonRes({ error: "Unexpected error" }, 500);
  }
});
