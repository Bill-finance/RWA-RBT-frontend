"use client";

import { motion } from "framer-motion";
import AnimatedSection from "./AnimatedSection";
import GlowingCard from "./GlowingCard";

const partners = [
  { name: "Ethereum", role: "Blockchain" },
  { name: "Polygon", role: "Scaling Solution" },
  { name: "Chainlink", role: "Oracle Provider" },
  { name: "Aave", role: "Lending Protocol" },
  { name: "MetaMask", role: "Wallet Partner" },
  { name: "Ledger", role: "Security Partner" },
];

export default function Partners() {
  return (
    <div className="min-h-screen py-24 px-4 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-blue-500/5" />

      {/* Content */}
      <div className="max-w-6xl mx-auto relative">
        {/* Section Title */}
        <AnimatedSection className="text-center mb-20" threshold={0.2}>
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Trusted Partners
          </h2>
          <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
            Working with industry leaders to build the future of finance
          </p>
        </AnimatedSection>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner, index) => (
            <AnimatedSection
              key={partner.name}
              threshold={0.2}
              delay={index * 0.1}
            >
              <GlowingCard
                className="p-6 h-full"
                glowColor={`rgba(${
                  index % 2 ? "147, 51, 234" : "59, 130, 246"
                }, 0.2)`}
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{partner.name}</h3>
                    <p className="text-gray-400">{partner.role}</p>
                  </div>
                  <motion.div
                    className="mt-4 inline-flex"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10">
                      Official Partner
                    </span>
                  </motion.div>
                </div>
              </GlowingCard>
            </AnimatedSection>
          ))}
        </div>

        {/* Call to Action */}
        <AnimatedSection className="text-center mt-20" threshold={0.3}>
          <GlowingCard
            className="p-8 inline-block"
            glowColor="rgba(59, 130, 246, 0.15)"
          >
            <h3 className="text-2xl font-bold mb-4">Become a Partner</h3>
            <p className="text-gray-400 mb-6 max-w-lg mx-auto">
              Join our ecosystem and help shape the future of Real World Assets
              in DeFi
            </p>
            <motion.button
              className="px-6 py-2 rounded-full bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact Us
            </motion.button>
          </GlowingCard>
        </AnimatedSection>
      </div>
    </div>
  );
}
