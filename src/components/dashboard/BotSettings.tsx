import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings, Bell, Palette, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

const interfaceThemes = [
  { id: 'dark', label: 'Default Dark', description: 'Clean dark interface', color: 'hsl(320 100% 60%)' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', description: 'Intense neon aesthetics', color: 'hsl(180 100% 50%)' },
  { id: 'minimal', label: 'Minimal Light', description: 'Clean & sophisticated', color: 'hsl(0 0% 15%)' },
  { id: 'minimal-dark', label: 'Minimal Dark', description: 'Subtle dark tones', color: 'hsl(0 0% 70%)' },
  { id: 'light', label: 'Light Mode', description: 'Bright & clear', color: 'hsl(320 100% 50%)' },
];

export function BotSettings() {
  const { theme, setTheme } = useTheme();
  const [riskLevel, setRiskLevel] = useState('2');
  const [lotSize, setLotSize] = useState('0.01');
  const [maxTrades, setMaxTrades] = useState('5');
  const [stopLoss, setStopLoss] = useState('50');
  const [takeProfit, setTakeProfit] = useState('100');
  const [notifications, setNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoTrade, setAutoTrade] = useState(true);

  const handleSave = () => {
    const lot = parseFloat(lotSize);
    const risk = parseFloat(riskLevel);
    if (isNaN(lot) || lot < 0.01 || lot > 100) {
      toast.error('Lot size must be between 0.01 and 100');
      return;
    }
    if (isNaN(risk) || risk < 0.5 || risk > 10) {
      toast.error('Risk level must be between 0.5% and 10%');
      return;
    }
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Interface / Theme Selection */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">Interface</CardTitle>
              <CardDescription>Choose your dashboard look</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {interfaceThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  theme === t.id
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/50'
                    : 'border-border bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-lg border border-border/50 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: t.color }}
                >
                  {theme === t.id && <Check className="h-5 w-5 text-white drop-shadow-md" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trading Settings */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">Trading Settings</CardTitle>
              <CardDescription>Configure your bot behavior</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Risk Level (%)</Label>
              <Input
                type="number"
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                min="0.5"
                max="10"
                step="0.5"
                placeholder="e.g. 2"
              />
              <p className="text-xs text-muted-foreground">0.5–10%</p>
            </div>
            <div className="space-y-2">
              <Label>Lot Size</Label>
              <Input
                type="number"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                min="0.01"
                max="100"
                step="0.01"
                placeholder="e.g. 0.01"
              />
              <p className="text-xs text-muted-foreground">0.01–100</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stop Loss (pips)</Label>
              <Input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                min="5"
                max="500"
                step="5"
                placeholder="e.g. 50"
              />
            </div>
            <div className="space-y-2">
              <Label>Take Profit (pips)</Label>
              <Input
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                min="5"
                max="1000"
                step="5"
                placeholder="e.g. 100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Max Open Trades</Label>
            <Input
              type="number"
              value={maxTrades}
              onChange={(e) => setMaxTrades(e.target.value)}
              min="1"
              max="50"
              step="1"
              placeholder="e.g. 5"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <Label>Auto Trading</Label>
              <p className="text-xs text-muted-foreground">Execute trades automatically</p>
            </div>
            <Switch checked={autoTrade} onCheckedChange={setAutoTrade} />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">Notifications</CardTitle>
              <CardDescription>Alert preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-xs text-muted-foreground">Get notified of trades</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="space-y-0.5">
              <Label>Sound Alerts</Label>
              <p className="text-xs text-muted-foreground">Play sound on new trades</p>
            </div>
            <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleSave}>
        Save Settings
      </Button>
    </div>
  );
}
