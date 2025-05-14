"use client";

import React from "react";
import { motion } from "framer-motion";
import { WalletOutlined } from "@ant-design/icons";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function WalletButton({
  className = "",
}: {
  className?: string;
}) {
  const truncateAddress = (addr?: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        if (connected) {
          return (
            <div className={`flex items-center gap-2 ${className}`}>
              <motion.div
                className="relative flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-700"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                onClick={() => {
                  openAccountModal();
                }}
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

                {/* 地址 */}
                <span className="text-zinc-300 text-sm font-medium">
                  {truncateAddress(account.address)}
                </span>

                {/* 分隔符 */}
                <span className="text-zinc-500 mx-1">|</span>

                {/* 网络信息 */}
                <div
                  className="flex items-center gap-1.5 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openChainModal();
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: chain.unsupported
                        ? "red"
                        : "rgb(239, 68, 68)",
                    }}
                  />
                  {chain.hasIcon && (
                    <div
                      style={{
                        background: chain.iconBackground,
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {chain.iconUrl && (
                        <img
                          alt={chain.name ?? "Chain icon"}
                          src={chain.iconUrl}
                          style={{ width: 14, height: 14 }}
                        />
                      )}
                    </div>
                  )}
                  <span className="text-zinc-300 text-xs font-medium">
                    {chain.name || chain.id}
                  </span>
                </div>

                {/* 按钮内微妙的光效 */}
                <motion.div
                  className="absolute inset-0 opacity-30 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)",
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
                    duration: 3,
                    ease: "linear",
                    repeatDelay: 0.5,
                  }}
                />
              </motion.div>

              {/* 验证状态按钮可以在这里添加，如果需要 */}
            </div>
          );
        }

        return (
          <motion.button
            className={`relative overflow-hidden rounded-full font-medium flex items-center gap-2 px-4 py-2 min-w-[160px] ${className}`}
            style={{
              background: "linear-gradient(45deg, #1a1a1a, #333333)",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
            }}
            onClick={openConnectModal}
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
      }}
    </ConnectButton.Custom>
  );
}
