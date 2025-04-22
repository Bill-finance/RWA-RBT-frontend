"use client";

import { DatePicker as AntdDatePicker } from "antd";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { Dayjs } from "dayjs";
import type { DatePickerProps as AntdDatePickerProps } from "antd";
import dayjs from "dayjs";

interface DatePickerProps
  extends Omit<AntdDatePickerProps, "onChange" | "value"> {
  label?: string;
  error?: string;
  value?: Date | Dayjs | null;
  onChange?: (date: Date | null) => void;
  className?: string;
  placeholder?: string;
}

export default function DatePicker({
  label,
  error,
  value,
  onChange,
  className = "",
  placeholder = "Select date",
  ...props
}: DatePickerProps) {
  const handleChange = (date: Dayjs | null) => {
    onChange?.(date ? date.toDate() : null);
  };

  const dayjsValue = value
    ? value instanceof Date
      ? dayjs(value)
      : value
    : null;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-gray-400 mb-2">{label}</label>
      )}
      <motion.div
        whileFocus={{ scale: 1.01 }}
        className={clsx("relative", error && "animate-shake")}
      >
        <AntdDatePicker
          value={dayjsValue}
          onChange={handleChange}
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
            "[&_.ant-picker-suffix]:!text-gray-400",
            "[&_.ant-picker-clear]:!bg-white/10 [&_.ant-picker-clear]:!text-gray-400",
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
