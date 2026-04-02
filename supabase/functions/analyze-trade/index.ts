import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chartImageBase64, symbol } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert technical chart analyst. You will be shown a trading chart screenshot. Analyze it carefully and provide:

1. **Direction**: Determine if this is a BUY or SELL setup. Consider candlestick patterns, support/resistance, trend lines, indicators visible on chart. Be unbiased - don't default to buy.
2. **Entry Price**: The recommended entry price based on the chart.
3. **Take Profit (TP)**: A realistic take profit level.
4. **Stop Loss (SL)**: A protective stop loss level.
5. **Confidence**: Rate 1-100 how confident you are.
6. **Reasoning**: Brief explanation of why.

IMPORTANT: You MUST respond in this EXACT JSON format and nothing else:
{
  "direction": "buy" or "sell",
  "entry": "price number",
  "takeProfit": "price number", 
  "stopLoss": "price number",
  "confidence": number,
  "symbol": "detected symbol or pair name",
  "summary": "brief explanation"
}

Analyze both bullish AND bearish signals equally. Look at:
- Trend direction (higher highs/lows vs lower highs/lows)
- Support and resistance levels
- Candlestick patterns (engulfing, pin bars, doji, etc.)
- Any visible indicators (MA, RSI, MACD, etc.)
- Volume if visible
- Price action context

Be accurate and unbiased. If the chart shows a bearish setup, say SELL. If bullish, say BUY.`;

    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    if (chartImageBase64) {
      // Use vision with the actual chart image
      messages.push({
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: chartImageBase64,
            },
          },
          {
            type: "text",
            text: `Analyze this trading chart screenshot. Detect the symbol/pair if visible. Provide your analysis in the exact JSON format specified. Be accurate about whether this is a buy or sell setup.${symbol ? ` The user says this is: ${symbol}` : ''}`,
          },
        ],
      });
    } else {
      // Fallback text-only
      messages.push({
        role: "user",
        content: `Analyze a ${symbol || "unknown"} chart and provide a sample analysis in the JSON format specified.`,
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
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
    const rawContent = data.choices?.[0]?.message?.content || "";
    
    console.log("Raw AI response:", rawContent);

    // Try to parse JSON from the response
    let analysis;
    try {
      // Extract JSON from possible markdown code blocks
      const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, rawContent];
      analysis = JSON.parse(jsonMatch[1].trim());
    } catch {
      // Fallback: parse from text
      const isBuy = /buy|bullish|long/i.test(rawContent);
      const isSell = /sell|bearish|short/i.test(rawContent);
      analysis = {
        direction: isSell ? 'sell' : isBuy ? 'buy' : 'neutral',
        entry: 'See analysis',
        takeProfit: 'See analysis',
        stopLoss: 'See analysis',
        confidence: 50,
        symbol: symbol || 'Unknown',
        summary: rawContent,
      };
    }

    return new Response(
      JSON.stringify({ analysis, timestamp: new Date().toISOString() }),
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
