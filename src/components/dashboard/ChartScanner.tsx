import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, TrendingUp, TrendingDown, Target, ShieldCheck, X, Zap } from 'lucide-react';
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
}

export function ChartScanner() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImagePreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const analyzeChart = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-trade', {
        body: {
          chartImageBase64: imagePreview,
        },
      });

      if (error) throw error;

      const analysis = data.analysis;
      if (!analysis) throw new Error('No analysis returned');

      setResult({
        direction: analysis.direction === 'sell' ? 'sell' : analysis.direction === 'buy' ? 'buy' : 'neutral',
        entry: String(analysis.entry || 'N/A'),
        takeProfit: String(analysis.takeProfit || 'N/A'),
        stopLoss: String(analysis.stopLoss || 'N/A'),
        confidence: Number(analysis.confidence) || 50,
        symbol: String(analysis.symbol || 'Unknown'),
        summary: String(analysis.summary || ''),
      });

      toast.success('Chart analyzed successfully!');
    } catch (err) {
      console.error('Chart analysis error:', err);
      toast.error('Failed to analyze chart. Try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const executeTrade = async (direction: 'buy' | 'sell') => {
    if (!result) return;

    const accountId = localStorage.getItem('mt_account_id');
    if (!accountId) {
      toast.error('Please connect your MetaTrader account in the MetaTrader tab first.');
      return;
    }

    setIsExecuting(true);
    try {
      const { data, error } = await supabase.functions.invoke('metaapi-trade', {
        body: {
          action: 'place_trade',
          accountId,
          symbol: result.symbol,
          volume: '0.01',
          actionType: direction === 'buy' ? 'ORDER_TYPE_BUY' : 'ORDER_TYPE_SELL',
          stopLoss: result.stopLoss !== 'N/A' && result.stopLoss !== 'See analysis' ? result.stopLoss : undefined,
          takeProfit: result.takeProfit !== 'N/A' && result.takeProfit !== 'See analysis' ? result.takeProfit : undefined,
        },
      });

      if (error) throw error;
      toast.success(`${direction.toUpperCase()} order placed for ${result.symbol}!`);
    } catch (err) {
      console.error('Trade execution error:', err);
      toast.error(`Failed to execute ${direction} trade. Check your MetaTrader connection.`);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Camera className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="font-display text-lg">Chart Scanner</CardTitle>
            <p className="text-xs text-muted-foreground">Upload or capture a chart for AI analysis</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
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
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
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
            <img
              src={imagePreview}
              alt="Chart"
              className="w-full rounded-xl border border-border max-h-48 object-cover"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-destructive/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Analyze Button */}
        <Button
          onClick={analyzeChart}
          disabled={!imagePreview || isAnalyzing}
          className="w-full"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Scanning chart...
            </>
          ) : (
            <>
              <Target className="h-4 w-4 mr-2" />
              Analyze Chart
            </>
          )}
        </Button>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {/* Signal Direction */}
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
                  </p>
                </div>
              </div>

              {/* Trade Levels */}
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

              {/* Execute Trade Buttons */}
              {result.direction !== 'neutral' && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => executeTrade('buy')}
                    disabled={isExecuting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    {isExecuting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Execute BUY
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => executeTrade('sell')}
                    disabled={isExecuting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                  >
                    {isExecuting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Execute SELL
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Summary */}
              <div className="p-3 rounded-xl bg-muted/20 border border-border">
                <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                  {result.summary}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
