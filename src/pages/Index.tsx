import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import TripleAI from "@/components/TripleAI";
import DecisionEngine from "@/components/DecisionEngine";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import UserGuide from "@/components/UserGuide";
import CTA from "@/components/CTA";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <div id="features">
        <TripleAI />
      </div>
      <DecisionEngine />
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <Features />
      <div id="guide">
        <UserGuide />
      </div>
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;
