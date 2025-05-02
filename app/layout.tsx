import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Modal } from "./components/Web3Modal";
import Header from "./components/Header";
import ThemeProvider from "./components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RWA-RBT Platform",
  description: "Digital tokenization of receivable accounts for investment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <Web3Modal>
          <ThemeProvider>
            <Header />
            <main className="pt-16">{children}</main>
          </ThemeProvider>
        </Web3Modal>
      </body>
    </html>
  );
}
