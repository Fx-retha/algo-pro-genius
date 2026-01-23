import NavBar from "@/components/NavBar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import AppShowcase from "@/components/AppShowcase";
import PricingSection from "@/components/PricingSection";
import DownloadSection from "@/components/DownloadSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <AppShowcase />
        <PricingSection />
        <DownloadSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
