import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';

const PhoneShowcaseScene = lazy(() => import('./3d/PhoneShowcaseScene').then(m => ({ default: m.PhoneShowcaseScene })));

const AppShowcase = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/10 via-background to-muted/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-4 block">
              Mobile Experience
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Trade from{" "}
              <span className="text-primary text-glow">anywhere</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our premium mobile app brings professional trading to your fingertips with stunning AI-powered interfaces
            </p>
          </div>
        </ScrollReveal>

        {/* 3D Phone Showcase */}
        <motion.div 
          className="h-[500px] md:h-[600px] relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            </div>
          }>
            <PhoneShowcaseScene className="w-full h-full" />
          </Suspense>
        </motion.div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {[
            { title: 'AI-Powered Analysis', desc: 'Real-time market insights powered by advanced AI' },
            { title: 'One-Tap Trading', desc: 'Execute trades instantly with our intuitive interface' },
            { title: 'Live Sync', desc: 'Your portfolio stays in sync across all devices' },
          ].map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1}>
              <div className="text-center p-6 glass-card rounded-xl">
                <h3 className="font-display text-lg font-semibold mb-2 text-foreground">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AppShowcase;
