"use client";

import React, { useEffect } from "react";
import { ConfigProvider } from "antd";
import { darkTheme, setGlobalStyles } from "../styles/theme";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  // 在客户端应用全局样式
  useEffect(() => {
    setGlobalStyles();
  }, []);

  return <ConfigProvider theme={darkTheme}>{children}</ConfigProvider>;
}
