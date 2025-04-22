"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { navigationItems } from "../const/navigation";

export default function Header() {
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            RWA
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <div
                key={item.name}
                className="relative group"
                onMouseEnter={() => setActiveSubMenu(item.name)}
                onMouseLeave={() => setActiveSubMenu(null)}
              >
                <Link
                  href={item.href}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>

                {/* Submenu */}
                {item.subItems && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: activeSubMenu === item.name ? 1 : 0,
                      y: activeSubMenu === item.name ? 0 : 10,
                    }}
                    className="absolute top-full left-0 mt-2 w-48 bg-black/90 border border-white/10 rounded-lg shadow-lg"
                  >
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className="block px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
