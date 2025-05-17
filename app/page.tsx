import GridBackground from "./components/ui/GridBackground";
import Hero from "./components/home/Hero";
import Features from "./components/home/Features";
import Partners from "./components/home/Partners";

export default function Home() {
  return (
    <main className="relative">
      <GridBackground />
      <Hero />
      <Features />
      <Partners />
    </main>
  );
}
