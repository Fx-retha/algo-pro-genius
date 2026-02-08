import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, Lock, User, Phone, Key, Loader2, ArrowRight } from "lucide-react";
import { z } from "zod";

// Phone validation schema
const phoneSchema = z.string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number must be at most 15 digits")
  .regex(/^\+?[0-9\s\-()]+$/, "Invalid phone number format");

type Step = 'license' | 'auth' | 'forgot-password' | 'reset-sent';

const LicenseAuth = () => {
  const [step, setStep] = useState<Step>('license');
  const [isLogin, setIsLogin] = useState(true);
  const [licenseKey, setLicenseKey] = useState("");
  const [validatedLicense, setValidatedLicense] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in with valid license
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validateLicenseKey = async () => {
    if (!licenseKey.trim()) return;
    
    setLoading(true);
    setLicenseError(null);

    try {
      // Check if license exists and is valid
      const { data: license, error } = await supabase
        .from('license_keys')
        .select('*')
        .eq('key', licenseKey.toUpperCase())
        .single();

      if (error || !license) {
        setLicenseError('Invalid license key');
        setLoading(false);
        return;
      }

      if (license.status !== 'active') {
        setLicenseError('This license key is not active');
        setLoading(false);
        return;
      }

      if (license.expires_at && new Date(license.expires_at) < new Date()) {
        setLicenseError('This license key has expired');
        setLoading(false);
        return;
      }

      // License is valid
      setValidatedLicense(licenseKey.toUpperCase());
      setStep('auth');
      toast({
        title: "License verified!",
        description: "Please sign in or create an account to continue.",
      });
    } catch (err) {
      setLicenseError('Error validating license key');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        
        // After login, activate license if not already activated
        if (validatedLicense) {
          const { data: existingLicense } = await supabase
            .from('license_keys')
            .select('user_id')
            .eq('key', validatedLicense)
            .single();

          if (existingLicense && !existingLicense.user_id) {
            // Get current user
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
              await supabase
                .from('license_keys')
                .update({
                  user_id: currentUser.id,
                  activated_at: new Date().toISOString(),
                })
                .eq('key', validatedLicense);
            }
          }
        }

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        navigate("/dashboard");
      } else {
        // Validate phone number with zod
        try {
          phoneSchema.parse(phoneNumber);
          setPhoneError(null);
        } catch (e) {
          if (e instanceof z.ZodError) {
            setPhoneError(e.errors[0]?.message || "Invalid phone number");
            toast({
              title: "Invalid phone number",
              description: e.errors[0]?.message || "Please enter a valid phone number.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        }

        const { error } = await signUp(email, password, fullName, phoneNumber);
        if (error) throw error;
        
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setStep('reset-sent');
      toast({
        title: "Email sent!",
        description: "Check your inbox for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
          onClick={() => {
            if (step === 'auth') {
              setStep('license');
              setValidatedLicense(null);
            } else if (step === 'forgot-password' || step === 'reset-sent') {
              setStep('auth');
            } else {
              navigate("/");
            }
          }}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {step === 'license' ? 'Back to home' : 'Back'}
        </button>

        {/* Auth Card */}
        <div className="glass-card rounded-2xl p-8 border border-border/50">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center neon-glow">
              <span className="font-display font-bold text-primary-foreground text-lg">CB</span>
            </div>
            <span className="font-display font-bold text-xl">Code Base Algo Pro</span>
          </div>

          {/* License Step */}
          {step === 'license' && (
            <>
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
            </>
          )}

          {/* Auth Step */}
          {step === 'auth' && (
            <>
              <h1 className="font-display text-2xl font-bold text-center mb-2">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                {isLogin
                  ? "Sign in to access your trading dashboard"
                  : "Complete your registration"}
              </p>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10 bg-muted/50 border-border"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="+1 234 567 8900"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            setPhoneError(null);
                          }}
                          className={`pl-10 bg-muted/50 border-border ${phoneError ? 'border-destructive' : ''}`}
                          required
                        />
                      </div>
                      {phoneError && (
                        <p className="text-sm text-destructive">{phoneError}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-muted/50 border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 bg-muted/50 border-border"
                    />
                  </div>
                </div>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setStep('forgot-password')}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full mt-6"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <p className="text-center mt-6 text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline font-semibold"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </>
          )}

          {/* Forgot Password Step */}
          {step === 'forgot-password' && (
            <>
              <h1 className="font-display text-2xl font-bold text-center mb-2">
                Reset Password
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                Enter your email to receive reset instructions
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-muted/50 border-border"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Reset Sent Step */}
          {step === 'reset-sent' && (
            <>
            <div className="mx-auto w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-emerald-500" />
              </div>
              <h1 className="font-display text-2xl font-bold text-center mb-2">
                Check Your Email
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>

              <Button
                onClick={() => setStep('auth')}
                variant="outline"
                size="lg"
                className="w-full"
              >
                Back to Sign In
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LicenseAuth;
