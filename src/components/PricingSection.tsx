import { Button } from "@/components/ui/button";
import { Check, Clock, Infinity } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Days License",
    price: "Limited",
    description: "Access for a set number of days",
    features: [
      "Time-based access",
      "Full bot functionality",
      "All trading pairs",
      "Community support",
      "Auto-expires after period",
    ],
    cta: "Get License",
    popular: false,
    icon: Clock,
  },
  {
    name: "Lifetime License",
    price: "Forever",
    description: "One-time access, never expires",
    features: [
      "Permanent access",
      "Full bot functionality",
      "All trading pairs",
      "Priority support 24/7",
      "All future updates",
      "No recurring fees",
    ],
    cta: "Get Lifetime",
    popular: true,
    icon: Infinity,
  },
];

const PricingSection = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Licensing
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Get Your <span className="text-primary text-glow">License Key</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose between a time-limited or lifetime license. All licenses are generated and managed by your mentor.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <ScrollReveal key={plan.name} delay={index * 0.1}>
              <div
                className={`relative h-full rounded-2xl p-8 transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular
                    ? "glass-card border-2 border-primary/50 shadow-[0_0_30px_hsl(320_100%_60%/0.2)]"
                    : "glass-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary to-accent px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-primary-foreground">
                      Best Value
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    plan.popular ? "bg-primary/20 neon-glow" : "bg-muted"
                  }`}>
                    <plan.icon className={`w-6 h-6 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                </div>

                <div className="mb-4">
                  <span className="font-display text-4xl font-bold">{plan.price}</span>
                </div>

                <p className="text-muted-foreground mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        plan.popular ? "bg-primary/20" : "bg-muted"
                      }`}>
                        <Check className={`w-3 h-3 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/license')}
                >
                  {plan.cta}
                </Button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
