"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

interface FileUploadProps {
  label?: string;
  error?: string;
  accept?: string;
  maxSize?: number;
  onFileSelect?: (file: File) => void;
  className?: string;
}

export default function FileUpload({
  label,
  error,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB default
  onFileSelect,
  className = "",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    if (file.size > maxSize) {
      // Handle file too large error
      return;
    }
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-gray-400 mb-2">{label}</label>
      )}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging
            ? "rgba(59, 130, 246, 0.5)"
            : "rgba(255, 255, 255, 0.1)",
        }}
        className={`
          relative
          min-h-[200px]
          border-2 border-dashed border-white/10
          rounded-lg
          bg-white/5
          transition-colors
          ${isDragging ? "bg-blue-500/5" : ""}
          ${className}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
          {selectedFile ? (
            <>
              <p className="text-white mb-2">{selectedFile.name}</p>
              <div className="flex space-x-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                >
                  Reset
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-400 text-center mb-4">
                Drag and drop your file here, or click to select
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 text-sm text-white bg-blue-500/10 rounded-full hover:bg-blue-500/20 transition-colors"
              >
                Select File
              </button>
            </>
          )}
        </div>
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
