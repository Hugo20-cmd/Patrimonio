import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import PatrimonioSection from "@/components/landing/PatrimonioSection";
import PricingSection from "@/components/landing/PricingSection";
import Footer from "@/components/landing/Footer";
import { supabase } from '@/lib/supabase'

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <PatrimonioSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
