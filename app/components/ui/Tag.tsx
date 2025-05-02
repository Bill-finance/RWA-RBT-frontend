"use client";

import React from "react";
import { Tag as AntTag, TagProps as AntTagProps } from "antd";
import { themeColors } from "../../styles/theme";

export interface CustomTagProps extends AntTagProps {
  variant?: "active" | "expired" | "overdue" | "repaid" | "pending" | "default";
  glow?: boolean;
}

export default function Tag({
  variant = "default",
  glow = false,
  color,
  className = "",
  children,
  ...rest
}: CustomTagProps) {
  // 根据variant属性设置标签样式
  let tagColor = color;
  let tagClassName = className;
  let borderStyle = {};

  if (!color && variant !== "default") {
    // 预设状态的色彩和样式
    switch (variant) {
      case "active":
        tagColor = "green";
        borderStyle = {
          background: "rgba(63, 134, 0, 0.1)",
          borderColor: "rgba(63, 134, 0, 0.8)",
          color: "#4ade80",
        };
        break;
      case "expired":
        tagColor = "red";
        borderStyle = {
          background: "rgba(207, 19, 34, 0.1)",
          borderColor: "rgba(207, 19, 34, 0.8)",
          color: "#f87171",
        };
        break;
      case "overdue":
        tagColor = "red";
        borderStyle = {
          background: "rgba(207, 19, 34, 0.1)",
          borderColor: "rgba(207, 19, 34, 0.8)",
          color: "#f87171",
        };
        break;
      case "repaid":
        tagColor = "blue";
        borderStyle = {
          background: "rgba(24, 144, 255, 0.1)",
          borderColor: "rgba(24, 144, 255, 0.8)",
          color: "#60a5fa",
        };
        break;
      case "pending":
        tagColor = "orange";
        borderStyle = {
          background: "rgba(250, 140, 22, 0.1)",
          borderColor: "rgba(250, 140, 22, 0.8)",
          color: "#fdba74",
        };
        break;
      default:
        tagColor = "default";
    }
  }

  // 添加发光效果
  if (glow) {
    let glowColor = "";

    switch (variant) {
      case "active":
        glowColor = "0 0 8px rgba(63, 134, 0, 0.6)";
        break;
      case "expired":
      case "overdue":
        glowColor = "0 0 8px rgba(207, 19, 34, 0.6)";
        break;
      case "repaid":
        glowColor = "0 0 8px rgba(24, 144, 255, 0.6)";
        break;
      case "pending":
        glowColor = "0 0 8px rgba(250, 140, 22, 0.6)";
        break;
      default:
        if (color) {
          // 如果有自定义颜色，使用该颜色的发光效果
          const colorMap: Record<string, string> = {
            green: "0 0 8px rgba(63, 134, 0, 0.6)",
            red: "0 0 8px rgba(207, 19, 34, 0.6)",
            blue: "0 0 8px rgba(24, 144, 255, 0.6)",
            orange: "0 0 8px rgba(250, 140, 22, 0.6)",
            yellow: "0 0 8px rgba(250, 204, 20, 0.6)",
            purple: "0 0 8px rgba(126, 58, 242, 0.6)",
            cyan: "0 0 8px rgba(6, 182, 212, 0.6)",
          };
          glowColor =
            colorMap[color as string] || "0 0 8px rgba(255, 255, 255, 0.3)";
        } else {
          glowColor = "0 0 8px rgba(255, 255, 255, 0.3)";
        }
    }

    borderStyle = {
      ...borderStyle,
      boxShadow: glowColor,
    };
  }

  // Web3-style的标签
  tagClassName = `rounded-md text-xs font-medium px-2.5 py-1 ${tagClassName}`;

  // 如果是预设变体使用自定义样式，否则使用Ant Design的颜色系统
  if (variant !== "default" && !color) {
    return (
      <span
        className={tagClassName}
        style={{
          ...borderStyle,
          borderWidth: "1px",
          borderStyle: "solid",
          borderRadius: "4px",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          ...rest.style,
        }}
        {...rest}
      >
        {children}
      </span>
    );
  }

  return (
    <AntTag
      color={tagColor}
      className={tagClassName}
      style={{
        ...borderStyle,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        ...rest.style,
      }}
      {...rest}
    >
      {children}
    </AntTag>
  );
}
