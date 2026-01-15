import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Star } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for getting started",
    features: [
      "1 Trading Account",
      "Basic Copy Trading",
      "Community Support",
      "Standard Sync Speed",
    ],
    cta: "Get Started",
    popular: false,
    icon: Zap,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For serious traders",
    features: [
      "5 Trading Accounts",
      "Advanced Copy Trading",
      "Priority Support 24/7",
      "Instant Sync Speed",
      "Custom Risk Management",
      "Analytics Dashboard",
    ],
    cta: "Start Pro Trial",
    popular: true,
    icon: Star,
  },
  {
    name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "For trading teams & mentors",
    features: [
      "Unlimited Accounts",
      "White-label Solution",
      "Dedicated Account Manager",
      "API Access",
      "Custom Integrations",
      "Advanced Analytics",
      "Team Management",
    ],
    cta: "Contact Sales",
    popular: false,
    icon: Crown,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Pricing
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Choose Your <span className="text-primary text-glow">Trading Plan</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Start free and scale as you grow. All plans include core features.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                      Most Popular
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
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
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
