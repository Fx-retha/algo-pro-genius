import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, price, volume, trend } = await req.json();
    
    console.log("Analyzing trade signal for:", { symbol, price, volume, trend });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert algorithmic trading analyst. Analyze trade signals and explain market patterns in a clear, actionable way. 

Your analysis should include:
1. Signal Strength: Rate the signal from 1-10
2. Pattern Recognition: Identify any chart patterns or market conditions
3. Risk Assessment: Evaluate potential risks
4. Recommendation: Provide a clear buy/sell/hold recommendation with reasoning

Keep responses concise but insightful. Use professional trading terminology but explain complex concepts simply.`;

    const userPrompt = `Analyze this trade signal:
- Symbol: ${symbol || "BTC/USD"}
- Current Price: ${price || "$45,000"}
- 24h Volume: ${volume || "High"}
- Trend Direction: ${trend || "Bullish"}

Provide a comprehensive analysis of this market condition and potential trading opportunities.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get AI analysis");
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "Unable to generate analysis";

    console.log("Analysis generated successfully");

    return new Response(
      JSON.stringify({ analysis, symbol, timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-trade function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
