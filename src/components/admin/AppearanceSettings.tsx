import { useThemePreference } from '@/hooks/useThemePreference';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Palette, Sun, Moon, Monitor, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const themes = [
  { id: 'light', label: 'Light', icon: Sun, description: 'Clean and bright interface' },
  { id: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes in low light' },
  { id: 'system', label: 'System', icon: Monitor, description: 'Follow your system settings' },
];

const accentColors = [
  { id: 'cyan', color: 'bg-cyan-500', label: 'Cyan' },
  { id: 'blue', color: 'bg-blue-500', label: 'Blue' },
  { id: 'purple', color: 'bg-purple-500', label: 'Purple' },
  { id: 'pink', color: 'bg-pink-500', label: 'Pink' },
  { id: 'green', color: 'bg-green-500', label: 'Green' },
  { id: 'orange', color: 'bg-orange-500', label: 'Orange' },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useThemePreference();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Appearance</h1>
        <p className="text-muted-foreground">Customize how the app looks and feels</p>
      </div>

      {/* Theme Selection */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as 'light' | 'dark' | 'system')}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all text-left",
                  theme === t.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                )}
              >
                {theme === t.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
                  <t.icon className="h-5 w-5" />
                </div>
                <h3 className="font-medium">{t.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accent Color */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="font-display">Accent Color</CardTitle>
          <p className="text-sm text-muted-foreground">Choose your preferred accent color</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <button
                key={color.id}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110",
                  color.color
                )}
                title={color.label}
              >
                {color.id === 'cyan' && (
                  <Check className="h-5 w-5 text-white" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Note: Accent color customization coming soon
          </p>
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="font-display">Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Font Size</Label>
            <RadioGroup defaultValue="medium" className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small" className="text-sm">Small</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="text-lg">Large</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Reduce Motion</Label>
            <p className="text-sm text-muted-foreground">
              Reduce animations and transitions throughout the app
            </p>
            <Button variant="outline" size="sm">
              Enable Reduced Motion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
