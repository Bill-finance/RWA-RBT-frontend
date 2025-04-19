import GridBackground from "./components/GridBackground";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Partners from "./components/Partners";

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
