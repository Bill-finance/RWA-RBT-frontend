"use client";

import React from "react";
import { Button as AntButton, ButtonProps as AntButtonProps } from "antd";
import { componentStyles } from "../../styles/theme";
import { motion } from "framer-motion";

// 去掉原有的variant属性，创建自定义属性
export interface CustomButtonProps extends Omit<AntButtonProps, "variant"> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "link"
    | "gradient"
    | "danger";
  animated?: boolean;
  glowing?: boolean;
}

const GlowingButton = ({
  children,
  className,
  variant = "primary",
  style,
  ...props
}: CustomButtonProps) => {
  // 根据variant获取样式
  let baseClassName = "";
  let colors = {
    from: "",
    via: "",
    to: "",
  };

  switch (variant) {
    case "primary":
      baseClassName = "bg-blue-600 hover:bg-blue-700 text-white";
      colors = {
        from: "rgb(37, 99, 235)",
        via: "rgb(59, 130, 246)",
        to: "rgb(37, 99, 235)",
      };
      break;
    case "danger":
      baseClassName = "bg-red-600 hover:bg-red-700 text-white";
      colors = {
        from: "rgb(220, 38, 38)",
        via: "rgb(248, 113, 113)",
        to: "rgb(220, 38, 38)",
      };
      break;
    case "gradient":
      baseClassName = "text-white";
      colors = {
        from: "rgb(37, 99, 235)",
        via: "rgb(147, 51, 234)",
        to: "rgb(37, 99, 235)",
      };
      break;
    default:
      baseClassName = "bg-blue-600 hover:bg-blue-700 text-white";
      colors = {
        from: "rgb(37, 99, 235)",
        via: "rgb(59, 130, 246)",
        to: "rgb(37, 99, 235)",
      };
  }

  const fullClassName = `${baseClassName} ${className || ""}`;

  return (
    <motion.div
      className="relative inline-block"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      style={style}
    >
      <motion.div
        className="absolute inset-0 rounded-full opacity-70 blur-md"
        animate={{
          background: [
            `radial-gradient(circle, ${colors.from} 0%, transparent 70%)`,
            `radial-gradient(circle, ${colors.via} 0%, transparent 70%)`,
            `radial-gradient(circle, ${colors.to} 0%, transparent 70%)`,
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
      <AntButton className={`relative z-10 ${fullClassName}`} {...props}>
        {children}
      </AntButton>
    </motion.div>
  );
};

// 封装Ant Design按钮组件
export default function Button({
  variant = "primary",
  animated = false,
  glowing = false,
  className = "",
  children,
  ...rest
}: CustomButtonProps) {
  // 如果需要发光效果，使用特殊的发光按钮
  if (glowing) {
    return (
      <GlowingButton variant={variant} className={className} {...rest}>
        {children}
      </GlowingButton>
    );
  }

  // 为不同变体设置不同的类名
  let btnClassName = "";

  switch (variant) {
    case "primary":
      btnClassName = componentStyles.button.primary;
      break;
    case "secondary":
      btnClassName = "bg-gray-700 hover:bg-gray-600 text-white";
      break;
    case "outline":
      btnClassName =
        "border border-zinc-600 hover:border-zinc-500 bg-transparent text-gray-300 hover:text-white";
      break;
    case "ghost":
      btnClassName =
        "bg-transparent text-gray-300 hover:text-white hover:bg-zinc-800";
      break;
    case "link":
      btnClassName =
        "bg-transparent text-blue-400 hover:text-blue-300 hover:underline";
      break;
    case "gradient":
      btnClassName =
        "text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-700";
      break;
    case "danger":
      btnClassName = "bg-red-600 hover:bg-red-700 text-white";
      break;
    default:
      btnClassName = componentStyles.button.default;
  }

  // 合并类名
  const finalClassName = `${btnClassName} ${className}`;

  // 如果需要动画效果，使用motion组件包装
  if (animated) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <AntButton className={finalClassName} {...rest}>
          {children}
        </AntButton>
      </motion.div>
    );
  }

  // 普通按钮
  return (
    <AntButton className={finalClassName} {...rest}>
      {children}
    </AntButton>
  );
}
