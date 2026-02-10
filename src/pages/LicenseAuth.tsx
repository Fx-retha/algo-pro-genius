import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Key, Loader2, ArrowRight } from "lucide-react";

const LicenseAuth = () => {
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [licenseError, setLicenseError] = useState<string | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();

  const validateLicenseKey = async () => {
    if (!licenseKey.trim()) return;

    setLoading(true);
    setLicenseError(null);

    try {
      const { data, error } = await supabase.rpc('validate_license_key', {
        license_key: licenseKey.trim()
      });

      if (error) {
        setLicenseError('Error validating license key');
        setLoading(false);
        return;
      }

      const result = data as { valid: boolean; error?: string; plan?: string; assigned?: boolean };

      if (!result.valid) {
        setLicenseError(result.error || 'Invalid license key');
        setLoading(false);
        return;
      }

      // License is valid — store and go straight to dashboard
      localStorage.setItem('validated_license_key', licenseKey.toUpperCase());
      toast({
        title: "License verified!",
        description: "Welcome to Code Base Algo Pro.",
      });
      navigate("/dashboard");
    } catch (err) {
      setLicenseError('Error validating license key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        {/* License Card */}
        <div className="glass-card rounded-2xl p-8 border border-border/50">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow">
              <span className="font-display font-bold text-primary-foreground text-lg">CB</span>
            </div>
            <span className="font-display font-bold text-xl">Code Base Algo Pro</span>
          </div>

          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Key className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-center mb-2">
            Enter License Key
          </h1>
          <p className="text-muted-foreground text-center mb-8">
            Enter your license key to access the trading platform
          </p>

          <div className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                className="text-center font-mono tracking-widest bg-muted/50 border-border"
                maxLength={19}
              />
            </div>
            {licenseError && (
              <p className="text-sm text-destructive text-center">{licenseError}</p>
            )}
            <Button
              onClick={validateLicenseKey}
              variant="hero"
              size="lg"
              className="w-full"
              disabled={loading || !licenseKey.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseAuth;
