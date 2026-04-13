
import BestSellingDesigns from "@/components/BestSellingDesigns";
import Hero from "@/components/Hero";
import ShopEssentials from "@/components/ShopEssentials";
import TextRevealSection from "@/components/TextRevealSection";
import { AudioProvider } from "@/hooks/AudioContext";
import InTheSpotlight from "@/components/Spotlight";
import Instagram from "@/components/Instagram";
import BornBetweenIntension from "@/components/BornBetweenIntension";
export default function Home() {
  return (
    <AudioProvider>
      <Hero />
      <BornBetweenIntension />
      <ShopEssentials />
      <TextRevealSection />
      <BestSellingDesigns />
      <InTheSpotlight />
      <Instagram />
    </AudioProvider>
  );
}
