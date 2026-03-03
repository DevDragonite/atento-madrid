import Navbar from "@/components/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import FusionSection from "@/components/sections/FusionSection";
import ReservationsSection from "@/components/sections/ReservationsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-cream min-h-screen">
      <Navbar />
      <HeroSection />
      <ExperienceSection />
      <FusionSection />
      <ReservationsSection />
      <Footer />
    </main>
  );
}
