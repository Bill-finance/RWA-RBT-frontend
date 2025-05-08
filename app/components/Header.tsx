"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useConnect, useDisconnect, useSignMessage } from "wagmi";
import { injected } from "wagmi/connectors";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Dropdown, message } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import WalletButton from "./ui/WalletButton";
import { isAuthenticated, logout } from "../utils/auth";
import { authApi } from "../utils/apis";

const menuItems = [
  // { name: "Home", path: "/" },
  { name: "Enterprise", path: "/enterprise" },

  {
    name: "My Credits",
    children: [
      { name: "My Bills", path: "/my-credits/my-bills" },
      { name: "My Issued Tokens", path: "/my-credits/my-issued-tokens" },
    ],
  },
  {
    name: "My Debts",
    children: [
      { name: "Repay Debt", path: "/my-debts/repay-debt" },
      { name: "My To-do List", path: "/my-debts/my-todolist" },
    ],
  },
  { name: "Token Market", path: "/token-market" },
  { name: "My Tokens", path: "/my-tokens" },
  // { name: "TestPage", path: "/testpage" },
];

export default function Header() {
  const pathname = usePathname();
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Handle hydration issue and check authentication status
  useEffect(() => {
    setMounted(true);
    setIsUserAuthenticated(isAuthenticated());
  }, []);

  // Handle wallet connection/disconnection
  const handleConnectWallet = async () => {
    try {
      await connect({ connector: injected() });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      message.error("Failed to connect wallet");
    }
  };

  const handleDisconnectWallet = () => {
    disconnect();
    // Also logout from backend
    logout();
    setIsUserAuthenticated(false);
  };

  // Handle wallet authentication
  const handleAuthenticate = async () => {
    if (!address || !isConnected) {
      message.error("Please connect your wallet first");
      return;
    }

    try {
      setIsAuthenticating(true);

      message.loading({
        content:
          "Please sign the message in your wallet to verify your identity...",
        key: "auth-message",
        duration: 0,
      });

      try {
        // 检查 address 是否有效
        console.log("Address:", address);

        // 获取 challenge
        const challengeRes = await authApi.generateChallenge({ address });
        console.log("Challenge Response:", challengeRes);

        if (!challengeRes || !challengeRes.data.nonce) {
          throw new Error("Failed to generate challenge");
        }
        console.log("Nonce to sign:", challengeRes.data.nonce);

        const signature = await signMessageAsync({
          message: challengeRes.data.nonce,
          account: address, // 明确指定账户
        }).catch((error) => {
          console.error("Signature error:", error);
          throw new Error(`Failed to sign message: ${error.message}`);
        });

        console.log("Signature:", signature);

        if (!signature) {
          throw new Error("Failed to sign message");
        }

        // 登录
        const loginRes = await authApi.login({
          requestId: challengeRes.data.requestId,
          signature,
        });
        console.log("Login Response:", loginRes);

        if (loginRes && loginRes.data.token) {
          localStorage.setItem("token", loginRes.data.token);
          setIsUserAuthenticated(true);
          message.destroy("auth-message");
          message.success({
            content: "Authentication successful! You are now verified.",
            icon: <div className="text-green-500">✓</div>,
            duration: 3,
          });
        } else {
          throw new Error("Invalid login response");
        }
      } catch (e) {
        console.error("Detailed authentication error:", e);
        message.destroy("auth-message");
        message.error(
          `Authentication failed: ${
            e instanceof Error ? e.message : "Unknown error"
          }`
        );
      }
    } catch (error) {
      message.destroy("auth-message");
      console.error("Authentication error:", error);
      message.error("Authentication failed. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const MobileMenu = () => (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-16 left-0 right-0 bg-black border border-zinc-800 shadow-xl py-4 rounded-b-lg z-50"
        >
          <nav className="flex flex-col px-4 gap-4">
            {menuItems.map((item) => (
              <div key={item.name} className="py-2">
                {item.children ? (
                  <>
                    <div className="text-zinc-400 text-sm font-medium mb-2">
                      {item.name}
                    </div>
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        href={child.path}
                        className={`block px-4 py-2 rounded-md transition-colors ${
                          pathname === child.path
                            ? "bg-blue-500/10 text-blue-400"
                            : "text-white hover:bg-zinc-800"
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    className={`block px-4 py-2 rounded-md transition-colors ${
                      pathname === item.path
                        ? "bg-blue-500/10 text-blue-400"
                        : "text-white hover:bg-zinc-800"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Create dropdown menus for navigation items with children
  const getNavItems = () => {
    return menuItems.map((item) => {
      if (item.children) {
        const items = item.children.map((child) => ({
          key: child.path,
          label: (
            <Link
              href={child.path}
              className={
                pathname === child.path ? "text-blue-400" : "text-white"
              }
            >
              {child.name}
            </Link>
          ),
        }));

        return (
          <Dropdown
            key={item.name}
            menu={{ items }}
            placement="bottomLeft"
            overlayClassName="custom-dropdown"
          >
            <span className="cursor-pointer text-zinc-400 hover:text-white transition-colors px-3 py-2">
              {item.name}
            </span>
          </Dropdown>
        );
      }

      return (
        <Link
          key={item.name}
          href={item.path}
          className={`px-3 py-2 transition-colors ${
            pathname === item.path
              ? "text-blue-400"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          {item.name}
        </Link>
      );
    });
  };

  const WalletConnection = () => {
    if (!mounted) {
      // 占位符
      return (
        <div className="hidden md:flex min-w-[200px] h-[40px]">
          <div className="w-full h-full rounded-full bg-zinc-900/50 animate-pulse" />
        </div>
      );
    }

    if (isConnected && address) {
      return (
        <div className="hidden md:flex items-center gap-2">
          <WalletButton
            address={address}
            isConnected={isConnected}
            onConnect={handleConnectWallet}
            onDisconnect={handleDisconnectWallet}
            className="hidden md:flex"
          />

          {!isUserAuthenticated && (
            <motion.button
              className="ml-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-medium text-sm shadow-lg shadow-blue-500/20 flex items-center"
              onClick={handleAuthenticate}
              disabled={isAuthenticating}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {isAuthenticating ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 15V17M6 7H18C19.1046 7 20 7.89543 20 9V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V9C4 7.89543 4.89543 7 6 7ZM16 7V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V7H16Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Verify Identity
                </>
              )}
            </motion.button>
          )}

          {isUserAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center ml-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-600/30 to-green-400/30 border border-green-500/50 text-green-300 font-medium text-sm"
            >
              <motion.div
                className="w-2 h-2 rounded-full bg-green-500 mr-2"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(74, 222, 128, 0)",
                    "0 0 0 4px rgba(74, 222, 128, 0.2)",
                    "0 0 0 0 rgba(74, 222, 128, 0)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
              <span>Verified</span>
            </motion.div>
          )}
        </div>
      );
    }

    return (
      <WalletButton
        address={address}
        isConnected={isConnected}
        onConnect={handleConnectWallet}
        onDisconnect={handleDisconnectWallet}
        className="hidden md:flex"
      />
    );
  };

  return (
    <header className="fixed w-full top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-8 h-8 rounded-md flex items-center justify-center text-white font-bold">
              RBT
            </div>
            <span className="text-white font-semibold hidden sm:block">
              RWA-RBT
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {getNavItems()}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: "white" }} />}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white"
            />
          </div>

          {/* Wallet Connection */}
          <WalletConnection />

          {/* Mobile Navigation */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
