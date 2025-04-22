"use client";

import { Upload as AntdUpload } from "antd";
import { motion } from "framer-motion";
import clsx from "clsx";
import { InboxOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";

interface FileUploadProps extends Omit<UploadProps, "onChange" | "fileList"> {
  label?: string;
  error?: string;
  value?: File[];
  onChange?: (files: File[]) => void;
  className?: string;
  accept?: string;
  maxSize?: number;
}

export default function FileUpload({
  label,
  error,
  value = [],
  onChange,
  className = "",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  ...props
}: FileUploadProps) {
  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept,
    fileList: value.map((file) => ({
      uid: file.name,
      name: file.name,
      status: "done",
      originFileObj: file,
    })),
    onChange: ({ fileList }) => {
      const files = fileList
        .map((file) => file.originFileObj)
        .filter((file): file is File => file !== undefined);
      onChange?.(files);
    },
    beforeUpload: (file) => {
      if (file.size > maxSize) {
        console.error(`File size cannot exceed ${maxSize / 1024 / 1024}MB`);
        return false;
      }
      return false;
    },
    ...props,
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-gray-400 mb-2">{label}</label>
      )}
      <motion.div
        whileFocus={{ scale: 1.01 }}
        className={clsx("relative", error && "animate-shake")}
      >
        <AntdUpload.Dragger
          {...uploadProps}
          className={clsx(
            "w-full",
            "bg-white/5",
            "border-white/10",
            "text-white",
            "hover:border-blue-500/20",
            "focus:ring-2 focus:ring-blue-500/20",
            "transition-all duration-200",
            "[&_.ant-upload-text]:!text-white/80",
            "[&_.ant-upload-hint]:!text-gray-400",
            "[&_.ant-upload-drag-icon_.anticon]:!text-blue-500",
            className
          )}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to upload</p>
          <p className="ant-upload-hint">
            Support for a single file upload. Maximum file size:{" "}
            {maxSize / 1024 / 1024}MB
          </p>
        </AntdUpload.Dragger>
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
