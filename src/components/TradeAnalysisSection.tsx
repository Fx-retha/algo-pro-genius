import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp, TrendingDown, Loader2, Sparkles, BarChart3, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ScrollReveal from "./ScrollReveal";

const TradeAnalysisSection = () => {
  const [symbol, setSymbol] = useState("BTC/USD");
  const [price, setPrice] = useState("45000");
  const [volume, setVolume] = useState("high");
  const [trend, setTrend] = useState("bullish");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsLoading(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-trade", {
        body: {
          symbol,
          price: `$${price}`,
          volume: volume.charAt(0).toUpperCase() + volume.slice(1),
          trend: trend.charAt(0).toUpperCase() + trend.slice(1),
        },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze trade signal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="ai-analysis" className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Brain className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Analysis</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Intelligent Trade Signal Analysis
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Let our AI analyze market patterns and provide actionable insights for your trading decisions.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-2 gap-8">
          <ScrollReveal delay={0.1}>
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Enter Trade Signal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Trading Pair</label>
                  <Select value={symbol} onValueChange={setSymbol}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC/USD">BTC/USD</SelectItem>
                      <SelectItem value="ETH/USD">ETH/USD</SelectItem>
                      <SelectItem value="SOL/USD">SOL/USD</SelectItem>
                      <SelectItem value="AAPL">AAPL (Apple)</SelectItem>
                      <SelectItem value="TSLA">TSLA (Tesla)</SelectItem>
                      <SelectItem value="SPY">SPY (S&P 500)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Price ($)</label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="45000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Volume</label>
                    <Select value={volume} onValueChange={setVolume}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="extreme">Extreme</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Trend</label>
                    <Select value={trend} onValueChange={setTrend}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bullish">
                          <span className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            Bullish
                          </span>
                        </SelectItem>
                        <SelectItem value="bearish">
                          <span className="flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-500" />
                            Bearish
                          </span>
                        </SelectItem>
                        <SelectItem value="sideways">Sideways</SelectItem>
                        <SelectItem value="volatile">Volatile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full mt-4"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Signal
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <Card className="border-border/50 bg-card/50 backdrop-blur h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  AI Analysis Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!analysis && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <Brain className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-center">
                      Enter trade signal parameters and click "Analyze Signal" to get AI-powered insights.
                    </p>
                  </div>
                )}

                {isLoading && (
                  <div className="flex flex-col items-center justify-center h-64">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="w-12 h-12 text-primary" />
                    </motion.div>
                    <p className="mt-4 text-muted-foreground">Analyzing market patterns...</p>
                  </div>
                )}

                {analysis && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-sm dark:prose-invert max-w-none"
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {analysis}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default TradeAnalysisSection;
