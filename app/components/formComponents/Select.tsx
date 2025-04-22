"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  value?: Option;
  onChange?: (option: Option) => void;
  options: Option[];
  className?: string;
}

export default function Select({
  label,
  error,
  value,
  onChange,
  options,
  className = "",
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-gray-400 mb-2">{label}</label>
      )}
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={`
              relative w-full
              px-4 py-2
              bg-white/5
              border border-white/10
              rounded-lg
              text-left
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/20
              transition-all duration-200
              ${error ? "border-red-500/50" : ""}
              ${className}
            `}
          >
            <span className="block truncate text-white">
              {value?.label || "Select an option"}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className="
                absolute z-10 mt-1 max-h-60 w-full
                overflow-auto
                rounded-lg
                bg-black/90
                border border-white/10
                backdrop-blur-xl
                py-1
                focus:outline-none
              "
            >
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option}
                  className={({ active, selected }) => `
                    relative cursor-pointer select-none
                    px-4 py-2
                    ${
                      active
                        ? "bg-blue-500/10 text-white"
                        : selected
                        ? "bg-blue-500/5 text-white"
                        : "text-gray-400"
                    }
                  `}
                >
                  {({ selected }) => (
                    <motion.span
                      initial={false}
                      animate={{
                        opacity: selected ? 1 : 0.8,
                      }}
                      className="block truncate"
                    >
                      {option.label}
                    </motion.span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
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
