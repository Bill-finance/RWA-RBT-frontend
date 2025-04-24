"use client";

import { motion } from "framer-motion";
import GlowingCard from "./GlowingCard";
import AnimatedSection from "./AnimatedSection";

export default function Hero() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
      {/* Immediate load animation for hero section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
          RWA DeFi Platform
        </h1>
        <p className="mt-4 text-xl text-gray-400">
          Bridging Real World Assets with DeFi Innovation
        </p>
      </motion.div>

      {/* Feature cards with scroll animation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-12">
        <AnimatedSection delay={0.1} threshold={0.3}>
          <GlowingCard className="p-6" glowColor="rgba(0, 255, 255, 0.2)">
            <h3 className="text-xl font-semibold mb-3">Asset Tokenization</h3>
            <p className="text-gray-400">
              Transform assets into digital tokens with full transparency and
              compliance
            </p>
          </GlowingCard>
        </AnimatedSection>

        <AnimatedSection delay={0.2} threshold={0.3}>
          <GlowingCard className="p-6" glowColor="rgba(147, 51, 234, 0.2)">
            <h3 className="text-xl font-semibold mb-3">Yield Generation</h3>
            <p className="text-gray-400">
              Generate sustainable yields through real-world asset backing
            </p>
          </GlowingCard>
        </AnimatedSection>

        <AnimatedSection delay={0.3} threshold={0.3}>
          <GlowingCard className="p-6" glowColor="rgba(59, 130, 246, 0.2)">
            <h3 className="text-xl font-semibold mb-3">Smart Liquidity</h3>
            <p className="text-gray-400">
              Access efficient liquidity pools backed by verified assets
            </p>
          </GlowingCard>
        </AnimatedSection>
      </div>

      {/* Stats section with scroll animation */}
      <AnimatedSection className="mt-24 w-full max-w-4xl" threshold={0.4}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h4 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              $1B+
            </h4>
            <p className="text-gray-400 mt-2">Total Value Locked</p>
          </div>
          <div className="text-center">
            <h4 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              50K+
            </h4>
            <p className="text-gray-400 mt-2">Active Users</p>
          </div>
          <div className="text-center">
            <h4 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
              100+
            </h4>
            <p className="text-gray-400 mt-2">Asset Types</p>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
