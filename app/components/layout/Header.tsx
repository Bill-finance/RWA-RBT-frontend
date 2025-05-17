"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Dropdown } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import WalletButton from "../ui/WalletButton";
import AuthButton from "../ui/AuthButton";

const menuItems = [
  // { name: "Home", path: "/" },
  { name: "Enterprise", path: "/enterprise" },

  {
    name: "My Credits",
    children: [
      { name: "Bills", path: "/my-credits/my-bills" },
      { name: "Packaged Batches", path: "/my-credits/my-processing-batches" },
      { name: "Issued Tokens", path: "/my-credits/my-issued-tokens" },
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
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Handle hydration issue
  useEffect(() => {
    setMounted(true);
  }, []);

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
      return (
        <div className="hidden md:flex min-w-[200px] h-[40px]">
          <div className="w-full h-full rounded-full bg-zinc-900/50 animate-pulse" />
        </div>
      );
    }

    if (address) {
      return (
        <div className="hidden md:flex items-center gap-2">
          <WalletButton className="hidden md:flex" />
          <AuthButton
            className="ml-2"
            isAuthenticated={isUserAuthenticated}
            setIsAuthenticated={(v: boolean) => {
              setIsUserAuthenticated(v);
            }}
          />
        </div>
      );
    }

    return <WalletButton className="hidden md:flex" />;
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
