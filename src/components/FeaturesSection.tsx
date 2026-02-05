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
    color: "#00f7ff",
  },
  {
    icon: Zap,
    title: "Instant Sync",
    description: "Real-time synchronization ensures your trades execute within milliseconds.",
    color: "#f0b429",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Bank-grade security with encrypted connections and secure API integrations.",
    color: "#10b981",
  },
  {
    icon: RefreshCw,
    title: "Auto Updates",
    description: "Stop loss and take profit modifications sync automatically to all connected accounts.",
    color: "#8b5cf6",
  },
  {
    icon: Globe,
    title: "Any Broker",
    description: "Compatible with virtually any MT4 or MT5 broker worldwide.",
    color: "#ec4899",
  },
  {
    icon: Clock,
    title: "24/7 Operation",
    description: "Our systems run continuously to ensure you never miss a trading opportunity.",
    color: "#f97316",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/20 to-transparent" />
      
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(to right, hsl(var(--primary) / 0.2) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(var(--primary) / 0.2) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px'
      }} />
      
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
              <div className="group glass-card rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] h-full relative overflow-hidden">
                {/* Gradient accent */}
                <div 
                  className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ background: feature.color }}
                />
                
                {/* Icon */}
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:neon-glow transition-all duration-300 relative">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="font-display text-xl font-semibold mb-3 text-foreground relative z-10">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed relative z-10">
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
