"use client";

import { Select as AntdSelect } from "antd";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { SelectProps as AntdSelectProps } from "antd";

interface Option {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<AntdSelectProps, "options" | "onChange" | "value"> {
  label?: string;
  error?: string;
  options: Option[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  className?: string;
  placeholder?: string;
}

export default function Select({
  label,
  error,
  options,
  value,
  onChange,
  multiple = false,
  className = "",
  placeholder = "请选择",
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-gray-400 mb-2">{label}</label>
      )}
      <motion.div
        whileFocus={{ scale: 1.01 }}
        className={clsx("relative", error && "animate-shake")}
      >
        <AntdSelect
          mode={multiple ? "multiple" : undefined}
          value={value}
          onChange={onChange}
          options={options}
          status={error ? "error" : undefined}
          placeholder={placeholder}
          className={clsx(
            "w-full",
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
