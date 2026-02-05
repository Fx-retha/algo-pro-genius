import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone, Globe } from 'lucide-react';

const setupMethods = [
  {
    id: 'desktop',
    title: 'Desktop Installation',
    description: 'Install the EA directly on your Windows PC with MetaTrader 4 or 5',
    icon: Monitor,
    steps: [
      'Download the EA file from the Downloads section',
      'Open MetaTrader and go to File → Open Data Folder',
      'Navigate to MQL4/Experts or MQL5/Experts',
      'Copy the EA file into the Experts folder',
      'Restart MetaTrader and attach EA to a chart',
    ],
    badge: 'Recommended',
  },
  {
    id: 'vps',
    title: 'VPS Setup',
    description: 'Run your EA 24/7 on a Virtual Private Server for uninterrupted trading',
    icon: Globe,
    steps: [
      'Choose a reliable Forex VPS provider',
      'Connect to your VPS via Remote Desktop',
      'Install MetaTrader on the VPS',
      'Follow the Desktop Installation steps',
      'Keep VPS running for 24/7 trading',
    ],
    badge: 'Best Performance',
  },
  {
    id: 'mobile',
    title: 'Mobile Monitoring',
    description: 'Monitor your trades on the go with the MetaTrader mobile app',
    icon: Smartphone,
    steps: [
      'Download MT4/MT5 app from App Store or Play Store',
      'Login with your broker account credentials',
      'View open trades and account status',
      'Receive push notifications for trade updates',
      'Note: EA execution requires desktop/VPS',
    ],
    badge: 'Monitoring Only',
  },
];

export function SetupMethods() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Setup Methods</h1>
        <p className="text-muted-foreground">Choose how you want to run your Expert Advisors</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {setupMethods.map((method) => (
          <Card key={method.id} className="bg-card/50 border-border">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <method.icon className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="secondary">{method.badge}</Badge>
              </div>
              <CardTitle className="font-display">{method.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{method.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="font-medium text-sm">Setup Steps:</h4>
                <ol className="space-y-2">
                  {method.steps.map((step, index) => (
                    <li key={index} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <span className="text-muted-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
