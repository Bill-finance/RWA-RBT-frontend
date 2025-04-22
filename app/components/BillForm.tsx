"use client";

import { useState } from "react";
import Input from "./formComponents/Input";
import DatePicker from "./formComponents/DatePicker";
import FileUpload from "./formComponents/FileUpload";
import { motion } from "framer-motion";

export interface BillFormData {
  payer: string;
  amount: string;
  billNumber: string;
  billDate: Date;
  billImage: File | null;
}

interface BillFormProps {
  initialData?: Partial<BillFormData>;
  onSubmit?: (data: BillFormData) => void;
  onRemove?: () => void;
}

export default function BillForm({
  initialData,
  onSubmit,
  onRemove,
}: BillFormProps) {
  const [formData, setFormData] = useState<BillFormData>({
    payer: initialData?.payer || "",
    amount: initialData?.amount || "",
    billNumber: initialData?.billNumber || "",
    billDate: initialData?.billDate || new Date(),
    billImage: initialData?.billImage || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 rounded-lg p-6 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Bill Information</h3>
        {onRemove && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRemove}
            className="text-red-400 hover:text-red-300"
          >
            Remove
          </motion.button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Payer"
            value={formData.payer}
            onChange={(e) =>
              setFormData({ ...formData, payer: e.target.value })
            }
            placeholder="Enter account address"
          />
          <Input
            label="Amount"
            prefix="¥"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            placeholder="Enter amount"
          />
        </div>

        {/* Bill Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Input
              label="Bill Number"
              value={formData.billNumber}
              onChange={(e) =>
                setFormData({ ...formData, billNumber: e.target.value })
              }
              placeholder="Enter bill number"
            />
            <DatePicker
              label="Bill Date"
              value={formData.billDate}
              onChange={(date) =>
                setFormData({ ...formData, billDate: date || new Date() })
              }
            />
          </div>
          <FileUpload
            label="Bill Image"
            accept="image/jpeg,image/png"
            maxSize={5 * 1024 * 1024}
            value={formData.billImage ? [formData.billImage] : []}
            onChange={(files) =>
              setFormData({ ...formData, billImage: files[0] || null })
            }
          />
        </div>
      </form>
    </motion.div>
  );
}
