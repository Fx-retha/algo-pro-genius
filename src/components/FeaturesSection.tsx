import { 
  Copy, 
  Zap, 
  Shield, 
  RefreshCw, 
  Globe, 
  Clock 
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const features = [
  {
    icon: Copy,
    title: "Copy Trading",
    description: "Automatically replicate trades from successful mentors to your account in real-time.",
  },
  {
    icon: Zap,
    title: "Instant Sync",
    description: "Real-time synchronization ensures your trades execute within milliseconds.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Bank-grade security with encrypted connections and secure API integrations.",
  },
  {
    icon: RefreshCw,
    title: "Auto Updates",
    description: "Stop loss and take profit modifications sync automatically to all connected accounts.",
  },
  {
    icon: Globe,
    title: "Any Broker",
    description: "Compatible with virtually any MT4 or MT5 broker worldwide.",
  },
  {
    icon: Clock,
    title: "24/7 Operation",
    description: "Our systems run continuously to ensure you never miss a trading opportunity.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Features
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Everything you need to{" "}
              <span className="text-primary text-glow">trade professionally</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful tools designed for professional traders and mentors
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 0.1}>
              <div className="group glass-card rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] h-full">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:neon-glow transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
