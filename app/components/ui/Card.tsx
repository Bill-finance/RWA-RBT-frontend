"use client";

import React from "react";
import { Card as AntCard, CardProps as AntCardProps } from "antd";
import { componentStyles } from "../../styles/theme";

// 扩展Ant Design Card组件的属性
export interface CardProps extends AntCardProps {
  withHover?: boolean;
}

// 封装Ant Design Card组件，应用自定义暗色主题样式
export default function Card({
  withHover = true,
  className = "",
  styles = {},
  children,
  ...rest
}: CardProps) {
  // 合并样式
  const cardStyles = {
    ...componentStyles.card.styles,
    ...styles,
  };

  // 构建类名
  let cardClassName = componentStyles.card.className;
  if (!withHover) {
    cardClassName = cardClassName.replace(
      "hover:shadow-lg transition-shadow",
      ""
    );
  }
  if (className) {
    cardClassName = `${cardClassName} ${className}`;
  }

  return (
    <AntCard className={cardClassName} styles={cardStyles} {...rest}>
      {children}
    </AntCard>
  );
}
