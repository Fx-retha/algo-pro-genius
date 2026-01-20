import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Monitor, Apple, Terminal } from 'lucide-react';
import { License } from '@/hooks/useLicense';

interface DownloadAreaProps {
  license: License | null;
}

const downloads = [
  { name: 'Windows', icon: Monitor, version: 'v2.4.1', size: '45 MB' },
  { name: 'macOS', icon: Apple, version: 'v2.4.1', size: '52 MB' },
  { name: 'Linux', icon: Terminal, version: 'v2.4.1', size: '41 MB' },
];

export function DownloadArea({ license }: DownloadAreaProps) {
  const handleDownload = (platform: string) => {
    // In production, this would trigger actual downloads
    console.log(`Downloading for ${platform}`);
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
                  onClick={() => handleDownload(item.name)}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Your license: <span className="font-mono">{license?.key}</span> will be automatically applied.
        </p>
      </CardContent>
    </Card>
  );
}
