"use client";

import { Input as AntdInput } from "antd";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { InputProps as AntdInputProps } from "antd";

interface InputProps extends Omit<AntdInputProps, "onChange"> {
  label?: string;
  error?: string;
  prefix?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  label,
  error,
  prefix,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-gray-400 mb-2">{label}</label>
      )}
      <motion.div
        whileFocus={{ scale: 1.01 }}
        className={clsx("relative", error && "animate-shake")}
      >
        <AntdInput
          prefix={prefix}
          status={error ? "error" : undefined}
          className={clsx(
            "bg-white/5",
            "border-white/10",
            "text-white",
            "placeholder:text-gray-500",
            "focus:ring-2 focus:ring-blue-500/20",
            "transition-all duration-200",
            className
          )}
          {...props}
        />
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
