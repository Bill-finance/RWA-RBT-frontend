"use client";

import React from "react";
import { motion } from "framer-motion";
import { WalletOutlined } from "@ant-design/icons";

interface WalletButtonProps {
  address?: string;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  className?: string;
}

export default function WalletButton({
  address,
  isConnected,
  onConnect,
  onDisconnect,
  className = "",
}: WalletButtonProps) {
  const truncateAddress = (addr?: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 断开连接按钮
  if (isConnected && address) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <motion.div
          className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          {/* 脉动的点 */}
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(74, 222, 128, 0)",
                "0 0 0 4px rgba(74, 222, 128, 0.3)",
                "0 0 0 0 rgba(74, 222, 128, 0)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop",
            }}
          />
          <span className="text-zinc-300 text-sm font-medium">
            {truncateAddress(address)}
          </span>
        </motion.div>

        {/* 断开连接按钮 */}
        <motion.button
          className="rounded-full text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-1.5"
          onClick={onDisconnect}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Disconnect
        </motion.button>
      </div>
    );
  }

  // 连接钱包按钮
  return (
    <motion.button
      className={`relative overflow-hidden rounded-full font-medium flex items-center gap-2 px-4 py-2 ${className}`}
      style={{
        background: "linear-gradient(45deg, #1a1a1a, #333333)",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
      }}
      onClick={onConnect}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* 背景渐变流光效果 */}
      <motion.div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)",
          skewX: "-20deg",
          top: 0,
          left: "-100%",
          width: "150%",
          height: "100%",
        }}
        animate={{
          left: ["-100%", "100%"],
        }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 2,
          ease: "linear",
          repeatDelay: 0.5,
        }}
      />

      {/* 边缘发光效果 */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0"
        animate={{
          boxShadow: [
            "0 0 0 1px rgba(59, 130, 246, 0.3)",
            "0 0 0 2px rgba(59, 130, 246, 0.2)",
            "0 0 0 3px rgba(59, 130, 246, 0.1)",
            "0 0 0 2px rgba(59, 130, 246, 0.2)",
            "0 0 0 1px rgba(59, 130, 246, 0.3)",
          ],
          opacity: [0.6, 0.8, 1, 0.8, 0.6],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
      />

      <WalletOutlined style={{ fontSize: "16px", color: "#60a5fa" }} />
      <span className="relative z-10 text-white">Connect Wallet</span>
    </motion.button>
  );
}
