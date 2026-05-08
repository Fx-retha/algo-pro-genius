import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Camera, Upload, Loader2, TrendingUp, TrendingDown, Target, ShieldCheck, X, Zap, History, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisResult {
  direction: 'buy' | 'sell' | 'neutral';
  entry: string;
  takeProfit: string;
  stopLoss: string;
  confidence: number;
  symbol: string;
  summary: string;
  livePrice?: number;
  spread?: number;
  executed?: boolean;
  scannedAt: string;
}

const HISTORY_KEY = 'chart_scan_history_v1';
const AUTO_KEY = 'chart_scan_auto_execute';

export function ChartScanner() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [autoExecute, setAutoExecute] = useState<boolean>(() => localStorage.getItem(AUTO_KEY) === '1');
  const [livePrice, setLivePrice] = useState<{ price: number; symbol: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const livePollRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(AUTO_KEY, autoExecute ? '1' : '0');
  }, [autoExecute]);

  const persistHistory = (next: AnalysisResult[]) => {
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, 20)));
  };

  const fetchLivePrice = async (symbol: string): Promise<{ price: number; spread: number } | null> => {
    const accountId = localStorage.getItem('mt_account_id');
    if (!accountId || !symbol || symbol === 'Unknown') return null;
    try {
      const { data, error } = await supabase.functions.invoke('metaapi-trade', {
        body: { action: 'get_symbol_price', accountId, symbol },
      });
      if (error || !data) return null;
      const bid = Number(data.bid ?? data.ask ?? 0);
      const ask = Number(data.ask ?? data.bid ?? 0);
      if (!bid && !ask) return null;
      return { price: (bid + ask) / 2 || bid || ask, spread: Math.max(0, ask - bid) };
    } catch {
      return null;
    }
  };

  // Real-time price polling for current result
  useEffect(() => {
    if (livePollRef.current) window.clearInterval(livePollRef.current);
    if (!result || !result.symbol || result.symbol === 'Unknown') return;
    const tick = async () => {
      const p = await fetchLivePrice(result.symbol);
      if (p) setLivePrice({ price: p.price, symbol: result.symbol });
    };
    tick();
    livePollRef.current = window.setInterval(tick, 5000);
    return () => {
      if (livePollRef.current) window.clearInterval(livePollRef.current);
    };
  }, [result?.symbol]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
      setResult(null);
      setLivePrice(null);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setResult(null);
    setLivePrice(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const executeTrade = async (analysis: AnalysisResult, direction: 'buy' | 'sell'): Promise<boolean> => {
    const accountId = localStorage.getItem('mt_account_id');
    if (!accountId) {
      toast.error('Connect MetaTrader in the MetaTrader tab to trade.');
      return false;
    }
    setIsExecuting(true);
    try {
      const { error } = await supabase.functions.invoke('metaapi-trade', {
        body: {
          action: 'place_trade',
          accountId,
          symbol: analysis.symbol,
          volume: '0.01',
          actionType: direction === 'buy' ? 'ORDER_TYPE_BUY' : 'ORDER_TYPE_SELL',
          stopLoss: analysis.stopLoss !== 'N/A' && analysis.stopLoss !== 'See analysis' ? analysis.stopLoss : undefined,
          takeProfit: analysis.takeProfit !== 'N/A' && analysis.takeProfit !== 'See analysis' ? analysis.takeProfit : undefined,
        },
      });
      if (error) throw error;
      toast.success(`${direction.toUpperCase()} order placed for ${analysis.symbol}!`);
      return true;
    } catch (err) {
      console.error('Trade execution error:', err);
      toast.error(`Failed to execute ${direction} trade. Check MetaTrader connection.`);
      return false;
    } finally {
      setIsExecuting(false);
    }
  };

  const analyzeChart = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-trade', {
        body: { chartImageBase64: imagePreview },
      });
      if (error) throw error;
      const analysis = data.analysis;
      if (!analysis) throw new Error('No analysis returned');

      const symbol = String(analysis.symbol || 'Unknown');
      const live = await fetchLivePrice(symbol);

      const built: AnalysisResult = {
        direction: analysis.direction === 'sell' ? 'sell' : analysis.direction === 'buy' ? 'buy' : 'neutral',
        entry: String(analysis.entry || 'N/A'),
        takeProfit: String(analysis.takeProfit || 'N/A'),
        stopLoss: String(analysis.stopLoss || 'N/A'),
        confidence: Number(analysis.confidence) || 50,
        symbol,
        summary: String(analysis.summary || ''),
        livePrice: live?.price,
        spread: live?.spread,
        scannedAt: new Date().toISOString(),
      };
      setResult(built);
      if (live) setLivePrice({ price: live.price, symbol });
      toast.success('Chart analyzed with live market data!');

      let executed = false;
      if (autoExecute && built.direction !== 'neutral' && built.confidence >= 65) {
        executed = await executeTrade(built, built.direction);
      }
      const final = { ...built, executed };
      setResult(final);
      persistHistory([final, ...history]);
    } catch (err) {
      console.error('Chart analysis error:', err);
      toast.error('Failed to analyze chart. Try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">Chart Scanner</CardTitle>
              <p className="text-xs text-muted-foreground">AI vision + live market data</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase text-muted-foreground">Auto</span>
            <Switch checked={autoExecute} onCheckedChange={setAutoExecute} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {!imagePreview ? (
          <div className="w-full border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Upload a chart image or take a photo</span>
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Gallery
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  const cameraInput = document.createElement('input');
                  cameraInput.type = 'file';
                  cameraInput.accept = 'image/*';
                  cameraInput.capture = 'environment';
                  cameraInput.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setImagePreview(ev.target?.result as string);
                      setResult(null);
                    };
                    reader.readAsDataURL(file);
                  };
                  cameraInput.click();
                }}
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img src={imagePreview} alt="Chart" className="w-full rounded-xl border border-border max-h-48 object-cover" />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-destructive/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <Button onClick={analyzeChart} disabled={!imagePreview || isAnalyzing} className="w-full" size="lg">
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scanning + fetching live price...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Analyze Chart {autoExecute && '& Auto-Trade'}
            </>
          )}
        </Button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${
                result.direction === 'buy'
                  ? 'border-green-500/30 bg-green-500/10'
                  : result.direction === 'sell'
                  ? 'border-red-500/30 bg-red-500/10'
                  : 'border-border bg-muted/20'
              }`}>
                {result.direction === 'buy' ? (
                  <TrendingUp className="h-6 w-6 text-green-500" />
                ) : result.direction === 'sell' ? (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                ) : (
                  <ShieldCheck className="h-6 w-6 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="font-bold text-sm uppercase">
                    {result.direction === 'buy' ? '🟢 BUY Signal' : result.direction === 'sell' ? '🔴 SELL Signal' : '⚪ Neutral'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {result.symbol} • Confidence: {result.confidence}%
                    {result.executed && ' • ✅ Executed'}
                  </p>
                </div>
                {livePrice && (
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-[10px] uppercase text-muted-foreground">
                      <Activity className="h-3 w-3 animate-pulse text-primary" /> Live
                    </div>
                    <p className="text-sm font-bold font-mono">{livePrice.price.toFixed(5)}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-muted/30 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Entry</p>
                  <p className="text-xs font-bold text-foreground">{result.entry}</p>
                </div>
                <div className="p-2 rounded-lg bg-green-500/10 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">TP</p>
                  <p className="text-xs font-bold text-green-500">{result.takeProfit}</p>
                </div>
                <div className="p-2 rounded-lg bg-red-500/10 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">SL</p>
                  <p className="text-xs font-bold text-red-500">{result.stopLoss}</p>
                </div>
              </div>

              {result.direction !== 'neutral' && !result.executed && (
                <div className="flex gap-3">
                  <Button
                    onClick={async () => {
                      const ok = await executeTrade(result, 'buy');
                      if (ok) setResult({ ...result, executed: true });
                    }}
                    disabled={isExecuting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="h-4 w-4 mr-2" />Execute BUY</>}
                  </Button>
                  <Button
                    onClick={async () => {
                      const ok = await executeTrade(result, 'sell');
                      if (ok) setResult({ ...result, executed: true });
                    }}
                    disabled={isExecuting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                  >
                    {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="h-4 w-4 mr-2" />Execute SELL</>}
                  </Button>
                </div>
              )}

              <div className="p-3 rounded-xl bg-muted/20 border border-border">
                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                  {result.summary}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Previous scans */}
        {history.length > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wider">Previous Scans</p>
              </div>
              <button
                onClick={() => persistHistory([])}
                className="text-[10px] text-muted-foreground hover:text-destructive"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => setResult(h)}
                  className="w-full text-left p-2 rounded-lg bg-muted/20 hover:bg-muted/40 border border-border transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {h.direction === 'buy' ? (
                        <TrendingUp className="h-3 w-3 text-green-500 shrink-0" />
                      ) : h.direction === 'sell' ? (
                        <TrendingDown className="h-3 w-3 text-red-500 shrink-0" />
                      ) : (
                        <ShieldCheck className="h-3 w-3 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-xs font-semibold truncate">{h.symbol}</span>
                      <span className="text-[10px] text-muted-foreground">{h.confidence}%</span>
                      {h.executed && <span className="text-[10px] text-green-500">✓</span>}
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(h.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
