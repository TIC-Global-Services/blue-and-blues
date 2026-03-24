import Hero from "@/components/Hero";
import { AudioProvider } from "@/hooks/AudioContext";

export default function Home() {
  return (
    <AudioProvider>
      <Hero />
    </AudioProvider>
  );
}
