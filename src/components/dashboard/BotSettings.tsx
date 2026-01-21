import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Palette, Bell, Shield, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

export function BotSettings() {
  const [riskLevel, setRiskLevel] = useState([2]);
  const [lotSize, setLotSize] = useState([0.01]);
  const [notifications, setNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoTrade, setAutoTrade] = useState(true);
  const [theme, setTheme] = useState('cyberpunk');

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="space-y-6 pb-20">
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
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Risk Level</Label>
              <span className="text-sm text-primary font-semibold">{riskLevel[0]}%</span>
            </div>
            <Slider
              value={riskLevel}
              onValueChange={setRiskLevel}
              max={10}
              min={0.5}
              step={0.5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Maximum risk per trade as % of balance</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Lot Size</Label>
              <span className="text-sm text-primary font-semibold">{lotSize[0]}</span>
            </div>
            <Slider
              value={lotSize}
              onValueChange={setLotSize}
              max={1}
              min={0.01}
              step={0.01}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">Default lot size for trades</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto Trading</Label>
              <p className="text-xs text-muted-foreground">Execute trades automatically</p>
            </div>
            <Switch checked={autoTrade} onCheckedChange={setAutoTrade} />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
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
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Notifications</Label>
              <p className="text-xs text-muted-foreground">Get notified of trades</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sound Alerts</Label>
              <p className="text-xs text-muted-foreground">Play sound on new trades</p>
            </div>
            <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">Appearance</CardTitle>
              <CardDescription>Customize the look</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cyberpunk">Cyberpunk Neon</SelectItem>
                <SelectItem value="minimal">Minimal Light</SelectItem>
                <SelectItem value="minimal-dark">Minimal Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleSave}>
        Save Settings
      </Button>
    </div>
  );
}
