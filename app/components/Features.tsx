"use client";

import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import GlowingCard from "./GlowingCard";

export default function Features() {
  return (
    <div className="min-h-screen py-24 px-4">
      {/* Section Title */}
      <AnimatedSection className="text-center mb-20" threshold={0.2}>
        <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
          Powerful Features
        </h2>
        <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
          Experience the next generation of RWA DeFi with our comprehensive
          suite of features
        </p>
      </AnimatedSection>

      {/* Feature 1: Security */}
      <AnimatedSection className="max-w-6xl mx-auto mb-32" threshold={0.3}>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block">
              <motion.div
                className="text-sm font-medium px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Security First
              </motion.div>
            </div>
            <h3 className="text-3xl font-bold">Enterprise-Grade Security</h3>
            <p className="text-gray-400">
              Our platform is built with multiple layers of security, including
              multi-sig wallets, time-locks, and regular security audits to
              ensure your assets are protected.
            </p>
            <ul className="space-y-3">
              {[
                "Multi-signature control",
                "Regular security audits",
                "Insurance coverage",
              ].map((item, index) => (
                <motion.li
                  key={item}
                  className="flex items-center text-gray-300"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <span className="mr-2 text-green-400">✓</span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <GlowingCard className="p-8" glowColor="rgba(59, 130, 246, 0.2)">
              <div className="aspect-square rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <motion.div
                  className="w-24 h-24 text-blue-400"
                  initial={{ scale: 0.8, rotate: -10 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  🔐
                </motion.div>
              </div>
            </GlowingCard>
          </div>
        </div>
      </AnimatedSection>

      {/* Feature 2: Liquidity */}
      <AnimatedSection className="max-w-6xl mx-auto mb-32" threshold={0.3}>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative">
            <GlowingCard className="p-8" glowColor="rgba(147, 51, 234, 0.2)">
              <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <motion.div
                  className="w-24 h-24 text-purple-400"
                  initial={{ scale: 0.8, rotate: 10 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  💧
                </motion.div>
              </div>
            </GlowingCard>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="inline-block">
              <motion.div
                className="text-sm font-medium px-4 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Deep Liquidity
              </motion.div>
            </div>
            <h3 className="text-3xl font-bold">Instant Access to Liquidity</h3>
            <p className="text-gray-400">
              Access deep liquidity pools backed by real-world assets, enabling
              efficient trading and yield generation opportunities.
            </p>
            <ul className="space-y-3">
              {[
                "Automated market making",
                "Cross-chain liquidity",
                "Flash loans",
              ].map((item, index) => (
                <motion.li
                  key={item}
                  className="flex items-center text-gray-300"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <span className="mr-2 text-purple-400">✓</span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
