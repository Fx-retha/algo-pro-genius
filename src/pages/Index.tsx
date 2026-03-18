import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import DownloadSection from "@/components/DownloadSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Full-page video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/background.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay for readability */}
      <div className="fixed inset-0 bg-background/70 z-0" />

      <div className="relative z-10">
        <NavBar />
        <main className="pt-16">
          <HeroSection />
          <FeaturesSection />
          <PricingSection />
          <DownloadSection />
          <FAQSection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
