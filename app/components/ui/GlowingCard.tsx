"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlowingCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  delay?: number;
}

export default function GlowingCard({
  children,
  className = "",
  glowColor = "rgba(0, 255, 255, 0.2)", // Default cyan glow
  delay = 0,
}: GlowingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`
        relative group
        rounded-xl
        bg-gradient-to-b from-neutral-900/50 to-neutral-900/30
        backdrop-blur-xl
        border border-neutral-800/50
        overflow-hidden
        ${className}
      `}
      style={{
        boxShadow: `0 0 30px ${glowColor}`,
      }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-900/5 to-neutral-900/50" />

      {/* Hover glow effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-[-1px] bg-gradient-to-r from-transparent via-neutral-500/10 to-transparent" />
        <div className="absolute inset-[-1px] bg-gradient-to-b from-transparent via-neutral-500/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
