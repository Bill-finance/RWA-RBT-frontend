"use client";

import React from "react";
import { Table as AntTable, TableProps as AntTableProps } from "antd";
import { componentStyles } from "../../styles/theme";

// 封装Ant Design Table组件，应用自定义暗色主题样式
export default function Table<RecordType extends object>({
  className = "",
  rowClassName = "",
  children,
  ...rest
}: AntTableProps<RecordType>) {
  // 构建类名
  const tableClassName = className
    ? `${componentStyles.table.className} ${className}`
    : componentStyles.table.className;

  // 构建行类名
  const tableRowClassName = (
    record: RecordType,
    index: number,
    indent?: number
  ) => {
    const defaultRowClassName = componentStyles.table.rowClassName as string;

    if (typeof rowClassName === "function") {
      // 调用原始rowClassName函数
      const customClassName = rowClassName(record, index, indent || 0);
      return `${defaultRowClassName} ${customClassName}`;
    }

    return rowClassName
      ? `${defaultRowClassName} ${rowClassName}`
      : defaultRowClassName;
  };

  return (
    <AntTable<RecordType>
      className={tableClassName}
      rowClassName={tableRowClassName}
      {...rest}
    >
      {children}
    </AntTable>
  );
}
