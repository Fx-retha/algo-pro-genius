import { Button } from "@/components/ui/button";
import { Smartphone, Apple, Crown, Download } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const DownloadSection = () => {
  return (
    <section id="download" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Standard Download */}
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Connect To <span className="text-secondary text-glow-cyan">App</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Get started with professional mobile trading
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-20">
          <ScrollReveal delay={0.1} direction="left">
            <div className="glass-card rounded-xl p-8 text-center hover:border-secondary/50 transition-all duration-300 h-full">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">Android</h3>
              <p className="text-muted-foreground mb-4">Connect to Android devices</p>
              <a href="https://play.google.com/store/apps/details?id=net.metaquotes.metatrader5" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="secondary" size="lg" className="w-full">
                  <Download className="w-5 h-5" />
                  Download APK
                </Button>
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2} direction="right">
            <div className="glass-card rounded-xl p-8 text-center hover:border-secondary/50 transition-all duration-300 h-full">
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-4">
                <Apple className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">iOS</h3>
              <p className="text-muted-foreground mb-4">iPhone and iPad support</p>
              <a href="https://apps.apple.com/app/metatrader-5/id413251709" target="_blank" rel="noopener noreferrer" className="w-full">
                <Button variant="secondary" size="lg" className="w-full">
                  <Download className="w-5 h-5" />
                  Download iOS
                </Button>
              </a>
            </div>
          </ScrollReveal>
        </div>

        {/* Premium Download */}
        <ScrollReveal>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-3xl" />
            <div className="relative glass-card rounded-3xl p-8 md:p-12 border border-primary/30">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Crown className="w-6 h-6 text-primary" />
                <span className="text-primary font-semibold uppercase tracking-wider">PRO</span>
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
                Download <span className="text-primary text-glow">Premium</span> App
              </h2>
              <p className="text-muted-foreground text-center text-lg mb-10">
                Premium trading experience for professional traders
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="bg-card rounded-xl p-6 text-center border border-border">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">Android</h3>
                  <p className="text-muted-foreground text-sm mb-4">Premium for Android devices</p>
                  <a href="https://play.google.com/store/apps/details?id=net.metaquotes.metatrader5" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="hero" size="lg" className="w-full">
                      Download Premium
                    </Button>
                  </a>
                </div>

                <div className="bg-card rounded-xl p-6 text-center border border-border">
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Apple className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">iOS</h3>
                  <p className="text-muted-foreground text-sm mb-4">Premium for iPhone and iPad</p>
                  <a href="https://apps.apple.com/app/metatrader-5/id413251709" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="hero" size="lg" className="w-full">
                      Download Premium
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default DownloadSection;
