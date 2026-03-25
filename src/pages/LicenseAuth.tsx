import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Key, Loader2, ArrowRight, CheckCircle, CreditCard } from "lucide-react";

const LicenseAuth = () => {
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePayClick = () => {
    window.open("https://www.paypal.com/ncp/payment/8ZGHV7WRTVX3N", "_blank", "noopener,noreferrer");
    setHasPaid(true);
  };

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
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        <div className="glass-card rounded-2xl p-8 border border-border/50">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow">
              <span className="font-display font-bold text-primary-foreground text-lg">CB</span>
            </div>
            <span className="font-display font-bold text-xl">Code Base Algo Pro</span>
          </div>

          {!hasPaid ? (
            <>
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-center mb-2">
                Step 1: Purchase License
              </h1>
              <p className="text-muted-foreground text-center mb-6">
                Complete your payment to receive a license key for the trading platform
              </p>

              <button
                onClick={handlePayClick}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797H9.603c-.564 0-1.04.408-1.13.964L7.076 21.337z"/>
                </svg>
                Pay with PayPal
              </button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                After payment, you'll receive your license key via email
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="font-display text-2xl font-bold text-center mb-2">
                Step 2: Enter License Key
              </h1>
              <p className="text-muted-foreground text-center mb-6">
                Enter the license key you received after payment
              </p>

              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  className="text-center font-mono tracking-widest bg-muted/50 border-border"
                  maxLength={19}
                />
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

                <button
                  onClick={() => setHasPaid(false)}
                  className="w-full text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  ← Back to payment
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LicenseAuth;
