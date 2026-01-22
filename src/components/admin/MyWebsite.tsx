import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, ExternalLink, Copy, Settings, BarChart3, Users, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function MyWebsite() {
  const { toast } = useToast();

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast({
      title: 'Link Copied',
      description: 'Website link has been copied to clipboard.',
    });
  };

  const websiteUrl = 'https://algo-pro-genius.lovable.app';
  const referralUrl = `${websiteUrl}?ref=47cTy`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">My Website</h1>
        <p className="text-muted-foreground">Manage your public website and referral links</p>
      </div>

      {/* Website Status */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Website Status
            </CardTitle>
            <Badge variant="outline" className="text-green-500 border-green-500/30">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Website URL</Label>
            <div className="flex gap-2">
              <Input value={websiteUrl} readOnly className="flex-1 font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyLink(websiteUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Referral Link</Label>
            <div className="flex gap-2">
              <Input value={referralUrl} readOnly className="flex-1 font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={() => copyLink(referralUrl)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link to track referrals and earn commissions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Website Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Page Views</span>
            </div>
            <p className="text-3xl font-bold font-display">2,847</p>
            <p className="text-xs text-green-500 mt-1">+12% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Referrals</span>
            </div>
            <p className="text-3xl font-bold font-display">156</p>
            <p className="text-xs text-green-500 mt-1">+8% from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Conversion Rate</span>
            </div>
            <p className="text-3xl font-bold font-display">5.4%</p>
            <p className="text-xs text-green-500 mt-1">+0.3% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Customization */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Customize Website
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Brand Name</Label>
              <Input defaultValue="Code Base Algo Pro" />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input defaultValue="Automated Trading Solutions" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Contact Email</Label>
            <Input type="email" placeholder="support@example.com" />
          </div>

          <div className="flex gap-2">
            <Button>Save Changes</Button>
            <Button variant="outline">Preview Website</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
