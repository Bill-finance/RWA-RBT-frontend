"use client";

import React from "react";
import { Card, Statistic, StatisticProps } from "antd";
import { componentStyles } from "../../styles/theme";

interface StatisticCardProps extends StatisticProps {
  cardClassName?: string;
  cardStyles?: React.CSSProperties;
}

// 封装带有统计数字的卡片组件
export default function StatisticCard({
  title,
  value,
  precision = 0,
  prefix,
  suffix,
  formatter,
  valueStyle,
  cardClassName = "",
  cardStyles = {},
  ...rest
}: StatisticCardProps) {
  // 合并样式
  const finalCardClassName = cardClassName
    ? `${componentStyles.statisticCard.className} ${cardClassName}`
    : componentStyles.statisticCard.className;

  const titleNode = title && <span className="text-zinc-400">{title}</span>;

  return (
    <Card className={finalCardClassName} style={cardStyles}>
      <Statistic
        title={titleNode}
        value={value}
        precision={precision}
        prefix={prefix}
        suffix={suffix}
        formatter={formatter}
        valueStyle={valueStyle}
        {...rest}
      />
    </Card>
  );
}
