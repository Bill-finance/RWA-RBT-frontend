"use client";

import React from "react";
import { Modal as AntModal, ModalProps as AntModalProps } from "antd";
import { componentStyles } from "../../styles/theme";

// 封装Ant Design Modal组件，应用自定义暗色主题样式
export default function Modal({
  className = "",
  styles = {},
  children,
  ...rest
}: AntModalProps) {
  // 合并样式
  const modalStyles = {
    ...componentStyles.modal.styles,
    ...styles,
  };

  // 构建类名
  const modalClassName = className
    ? `${componentStyles.modal.className} ${className}`
    : componentStyles.modal.className;

  return (
    <AntModal className={modalClassName} styles={modalStyles} {...rest}>
      {children}
    </AntModal>
  );
}
