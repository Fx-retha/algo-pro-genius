import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Target, DollarSign } from 'lucide-react';

const stats = [
  { label: 'Total Trades', value: '1,247', icon: BarChart3, change: '+12%' },
  { label: 'Win Rate', value: '73.2%', icon: Target, change: '+2.1%' },
  { label: 'Profit/Loss', value: '$12,458', icon: DollarSign, change: '+18%' },
  { label: 'Best Trade', value: '$892', icon: TrendingUp, change: '' },
];

export function TradeStats() {
  return (
    <Card className="glass-card lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <TrendingUp className="h-5 w-5 text-primary" />
          Trading Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-4 rounded-lg border border-border bg-muted/30"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-5 w-5 text-muted-foreground" />
                {stat.change && (
                  <span className="text-xs text-primary font-medium">{stat.change}</span>
                )}
              </div>
              <p className="text-2xl font-bold font-display">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Stats shown are demo data. Connect your trading account to see real performance.
        </p>
      </CardContent>
    </Card>
  );
}
