import MarketingNav from "@/components/MarketingNav";
import HeroSection from "@/components/HeroSection";
import SocialProofBar from "@/components/SocialProofBar";
import TransformationGallery from "@/components/TransformationGallery";
import HowItWorks from "@/components/HowItWorks";
import FeatureShowcase from "@/components/FeatureShowcase";
import PricingSection from "@/components/PricingSection";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-body overflow-x-hidden">
      <MarketingNav />
      <main>
        <HeroSection />
        <SocialProofBar />
        <TransformationGallery />
        <HowItWorks />
        <FeatureShowcase />
        <PricingSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
