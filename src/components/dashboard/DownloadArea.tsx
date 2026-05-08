import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Monitor, Apple, Smartphone } from 'lucide-react';
import { License } from '@/hooks/useLicense';
import { toast } from 'sonner';

interface DownloadAreaProps {
  license: License | null;
}

const downloads = [
  {
    name: 'Windows',
    icon: Monitor,
    version: 'MT5 Desktop',
    size: 'Installer',
    url: 'https://download.mql5.com/cdn/web/metaquotes.software.corp/mt5/mt5setup.exe',
  },
  {
    name: 'macOS',
    icon: Apple,
    version: 'MT5 for Mac',
    size: 'App Store',
    url: 'https://apps.apple.com/app/metatrader-5/id413251709',
  },
  {
    name: 'Android',
    icon: Smartphone,
    version: 'MT5 Mobile',
    size: 'Play Store',
    url: 'https://play.google.com/store/apps/details?id=net.metaquotes.metatrader5',
  },
];

export function DownloadArea({ license }: DownloadAreaProps) {
  const handleDownload = (item: typeof downloads[number]) => {
    toast.success(`Opening ${item.name} installer…`, {
      description: `Your license ${license?.key ?? ''} will be applied after install.`,
    });
    // Trigger a real download / store redirect in a new tab
    window.open(item.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="glass-card md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Download className="h-5 w-5 text-primary" />
          Download Trading Bot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {downloads.map((item) => (
            <div
              key={item.name}
              className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <item.icon className="h-10 w-10 text-primary" />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.version} • {item.size}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownload(item)}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Install
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Install MetaTrader 5 first, then your license{' '}
          <span className="font-mono">{license?.key}</span> connects the bot automatically.
        </p>
      </CardContent>
    </Card>
  );
}
