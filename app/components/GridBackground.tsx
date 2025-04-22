"use client";

import { motion } from "framer-motion";

interface GridBackgroundProps {
  className?: string;
}

export default function GridBackground({
  className = "",
}: GridBackgroundProps) {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {/* Grid pattern */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "url(/grid.svg)" }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />

      {/* Animated glow spots */}
      <motion.div
        className="absolute left-1/4 top-1/4 h-32 w-32 rounded-full bg-cyan-500/30 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.2, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute right-1/4 bottom-1/4 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.1, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
    </div>
  );
}
