"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface DatePickerProps {
  label?: string;
  error?: string;
  value?: Date;
  onChange?: (date: Date) => void;
  className?: string;
}

export default function DatePicker({
  label,
  error,
  value,
  onChange,
  className = "",
}: DatePickerProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-gray-400 mb-2">{label}</label>
      )}
      <motion.div
        whileFocus={{ scale: 1.01 }}
        className={`
          relative
          ${className}
        `}
      >
        <input
          type="date"
          value={value ? format(value, "yyyy-MM-dd") : ""}
          onChange={(e) => {
            const date = new Date(e.target.value);
            onChange?.(date);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`
            w-full px-4 py-2
            bg-white/5
            border border-white/10
            rounded-lg
            text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/20
            transition-all duration-200
            ${error ? "border-red-500/50" : ""}
            ${focused ? "ring-2 ring-blue-500/20 border-blue-500/20" : ""}
          `}
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
