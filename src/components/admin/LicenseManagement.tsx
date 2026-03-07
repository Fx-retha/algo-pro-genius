import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Key, Loader2, Copy, Check, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface License {
  id: string;
  key: string;
  user_id: string | null;
  status: string;
  plan: string;
  expires_at: string | null;
  activated_at: string | null;
  created_at: string;
}

export function LicenseManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLicensePlan, setNewLicensePlan] = useState<string>('days');
  const [expiresIn, setExpiresIn] = useState<string>('30');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLicenses = async () => {
    const { data, error } = await supabase
      .from('license_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLicenses(data as License[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const generateLicenseKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let segment = 0; segment < 4; segment++) {
      if (segment > 0) result += '-';
      for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    return result;
  };

  const createLicense = async () => {
    if (!user) return;
    
    setCreating(true);
    const key = generateLicenseKey();
    const expiresAt = expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 24 * 60 * 60 * 1000).toISOString() : null;

    const { error } = await supabase
      .from('license_keys')
      .insert({
        key,
        created_by: user.id,
        plan: newLicensePlan,
        expires_at: expiresAt,
      });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'License Created',
        description: `New ${newLicensePlan} license key generated successfully.`,
      });
      setDialogOpen(false);
      fetchLicenses();
    }
    setCreating(false);
  };

  const revokeLicense = async (id: string) => {
    const { error } = await supabase
      .from('license_keys')
      .update({ status: 'revoked' })
      .eq('id', id);

    if (!error) {
      toast({ title: 'License Revoked' });
      fetchLicenses();
    }
  };

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/20 text-green-500',
    revoked: 'bg-red-500/20 text-red-500',
    expired: 'bg-yellow-500/20 text-yellow-500',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 font-display">
          <Key className="h-5 w-5 text-primary" />
          License Keys
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Generate License
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New License</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={newLicensePlan} onValueChange={setNewLicensePlan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days License</SelectItem>
                    <SelectItem value="lifetime">Lifetime License</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newLicensePlan === 'days' && (
              <div className="space-y-2">
                <Label>Expires In (days)</Label>
                <Input
                  type="number"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  placeholder="Number of days"
                  min="1"
                />
              </div>
              )}
              </div>
              <Button onClick={createLicense} disabled={creating} className="w-full">
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate License Key'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>License Key</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((license) => (
                <TableRow key={license.id}>
                  <TableCell className="font-mono text-sm">
                    <div className="flex items-center gap-2">
                      {license.key}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyKey(license.key, license.id)}
                      >
                        {copiedId === license.id ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {license.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[license.status]}>
                      {license.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {license.user_id ? (
                      <span className="text-primary">Yes</span>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {license.expires_at
                      ? format(new Date(license.expires_at), 'MMM d, yyyy')
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right">
                    {license.status === 'active' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => revokeLicense(license.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {licenses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No licenses generated yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
