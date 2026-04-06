import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Bell, Palette, LayoutGrid, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import { ChartScanner } from './ChartScanner';
import { useInterfaceStyle } from '@/hooks/useInterfaceStyle';

const themes = [
  { id: 'dark', label: 'Default Dark', description: 'Clean dark interface', color: 'hsl(320 100% 60%)' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', description: 'Intense neon aesthetics', color: 'hsl(180 100% 50%)' },
  { id: 'minimal', label: 'Minimal Light', description: 'Clean & sophisticated', color: 'hsl(0 0% 15%)' },
  { id: 'minimal-dark', label: 'Minimal Dark', description: 'Subtle dark tones', color: 'hsl(0 0% 70%)' },
  { id: 'light', label: 'Light Mode', description: 'Bright & clear', color: 'hsl(320 100% 50%)' },
];

const interfaces = [
  {
    id: 'default',
    label: 'Standard',
    description: 'Balanced corners',
    shapeClass: 'rounded-xl',
    previewClass: 'w-14 h-14 rounded-xl',
  },
  {
    id: 'circle',
    label: 'Circle',
    description: 'Fully rounded',
    shapeClass: 'rounded-full',
    previewClass: 'w-14 h-14 rounded-full',
  },
  {
    id: 'square',
    label: 'Square',
    description: 'Sharp edges',
    shapeClass: 'rounded-none',
    previewClass: 'w-14 h-14 rounded-none',
  },
  {
    id: 'pill',
    label: 'Pill',
    description: 'Super smooth',
    shapeClass: 'rounded-3xl',
    previewClass: 'w-20 h-10 rounded-3xl',
  },
];

export function BotSettings() {
  const { theme, setTheme } = useTheme();
  const { style: activeInterface, setStyle: setActiveInterface } = useInterfaceStyle();
  const [notifications, setNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);

  return (
    <div className="space-y-6 pb-20">
      {/* Chart Scanner */}
      <ChartScanner />
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <LayoutGrid className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">Interface</CardTitle>
              <CardDescription>Choose your dashboard style</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {interfaces.map((iface) => (
              <button
                key={iface.id}
                onClick={() => {
                  setActiveInterface(iface.id as 'default' | 'circle' | 'square' | 'pill');
                  toast.success(`Interface: ${iface.label}`);
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  activeInterface === iface.id
                    ? 'border-primary bg-primary/10 ring-1 ring-primary/50'
                    : 'border-border bg-muted/20 hover:bg-muted/40'
                }`}
              >
                {/* Shape preview */}
                <div
                  className={`${iface.previewClass} border-2 flex items-center justify-center transition-colors ${
                    activeInterface === iface.id
                      ? 'border-primary bg-primary/20'
                      : 'border-muted-foreground/30 bg-muted/30'
                  }`}
                >
                  {activeInterface === iface.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-[10px] font-semibold text-foreground leading-tight text-center">
                  {iface.label}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme Selection */}
      <Card className="border-border bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">Theme</CardTitle>
              <CardDescription>Choose your color theme</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {themes.map((t) => (
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

      <Button className="w-full" size="lg" onClick={() => toast.success('Settings saved!')}>
        Save Settings
      </Button>
    </div>
  );
}
