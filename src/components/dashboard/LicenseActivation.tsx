import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, Loader2 } from 'lucide-react';

interface LicenseActivationProps {
  onActivate: (key: string) => Promise<{ error: string | null }>;
  error: string | null;
}

export function LicenseActivation({ onActivate, error }: LicenseActivationProps) {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;
    
    setLoading(true);
    await onActivate(licenseKey.trim());
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-display">Activate Your License</CardTitle>
          <CardDescription>
            Enter your license key to unlock full access to the trading bot and all features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                className="text-center font-mono tracking-widest"
                maxLength={19}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading || !licenseKey.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                'Activate License'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
