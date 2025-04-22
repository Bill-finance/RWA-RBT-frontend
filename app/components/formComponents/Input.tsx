"use client";

import { forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface InputProps extends Omit<HTMLMotionProps<"input">, "ref"> {
  label?: string;
  error?: string;
  prefix?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", prefix, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-gray-400 mb-2">{label}</label>
        )}
        <div className="relative">
          {prefix && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-400">{prefix}</span>
            </div>
          )}
          <motion.input
            ref={ref}
            whileFocus={{ scale: 1.01 }}
            className={`
              w-full px-4 py-2
              bg-white/5 
              border border-white/10
              rounded-lg
              text-white
              placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/20
              transition-all duration-200
              ${prefix ? "pl-7" : ""}
              ${error ? "border-red-500/50" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
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
);

Input.displayName = "Input";

export default Input;
