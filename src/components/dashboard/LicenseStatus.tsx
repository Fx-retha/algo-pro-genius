import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Calendar, Clock } from 'lucide-react';
import { License } from '@/hooks/useLicense';
import { format } from 'date-fns';

interface LicenseStatusProps {
  license: License | null;
}

export function LicenseStatus({ license }: LicenseStatusProps) {
  if (!license) return null;

  const statusColors = {
    active: 'bg-green-500/20 text-green-500 border-green-500/30',
    revoked: 'bg-red-500/20 text-red-500 border-red-500/30',
    expired: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  };

  const planColors = {
    basic: 'bg-muted text-muted-foreground',
    pro: 'bg-primary/20 text-primary border-primary/30',
    enterprise: 'bg-accent/20 text-accent border-accent/30',
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Shield className="h-5 w-5 text-primary" />
          License Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Status</span>
          <Badge variant="outline" className={statusColors[license.status]}>
            {license.status.charAt(0).toUpperCase() + license.status.slice(1)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Plan</span>
          <Badge variant="outline" className={planColors[license.plan]}>
            {license.plan.charAt(0).toUpperCase() + license.plan.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Activated
          </span>
          <span className="text-sm">
            {license.activated_at ? format(new Date(license.activated_at), 'MMM d, yyyy') : 'N/A'}
          </span>
        </div>

        {license.expires_at && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Expires
            </span>
            <span className="text-sm">
              {format(new Date(license.expires_at), 'MMM d, yyyy')}
            </span>
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground font-mono">{license.key}</p>
        </div>
      </CardContent>
    </Card>
  );
}
