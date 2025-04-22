"use client";

import { useState } from "react";
import AnimatedSection from "../components/AnimatedSection";
import BillForm, { BillFormData } from "../components/BillForm";
import Input from "../components/formComponents/Input";
import Select from "../components/formComponents/Select";
import { motion } from "framer-motion";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

export default function PlaygroundPage() {
  const [bills, setBills] = useState<BillFormData[]>([
    {
      payer: "",
      amount: "",
      billNumber: "",
      billDate: new Date(),
      billImage: null,
    },
  ]);

  const [queryData, setQueryData] = useState({
    billNumber: "",
    status: statusOptions[0].value,
  });

  const handleAddBill = () => {
    setBills([
      ...bills,
      {
        payer: "",
        amount: "",
        billNumber: "",
        billDate: new Date(),
        billImage: null,
      },
    ]);
  };

  const handleRemoveBill = (index: number) => {
    setBills(bills.filter((_, i) => i !== index));
  };

  const handleBillChange = (index: number, data: BillFormData) => {
    const newBills = [...bills];
    newBills[index] = data;
    setBills(newBills);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", bills);
  };

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Query submitted:", queryData);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Bill Upload Form */}
        <AnimatedSection threshold={0.1}>
          <h1 className="text-3xl font-bold mb-8">Bill Upload</h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {bills.map((bill, index) => (
              <BillForm
                key={index}
                initialData={bill}
                onSubmit={(data) => handleBillChange(index, data)}
                onRemove={
                  bills.length > 1 ? () => handleRemoveBill(index) : undefined
                }
              />
            ))}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleAddBill}
                className="px-4 py-2 text-blue-400 hover:text-blue-300"
              >
                + Add Bill
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Submit
              </motion.button>
            </div>
          </form>
        </AnimatedSection>

        {/* Bill Query */}
        <AnimatedSection className="mt-16" threshold={0.1}>
          <h2 className="text-2xl font-bold mb-6">Bill Query</h2>
          <form onSubmit={handleQuery} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Input
                placeholder="Enter bill number"
                value={queryData.billNumber}
                onChange={(e) =>
                  setQueryData({ ...queryData, billNumber: e.target.value })
                }
              />
              <Select
                options={statusOptions}
                value={queryData.status}
                onChange={(value) =>
                  setQueryData({ ...queryData, status: value as string })
                }
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Search
              </motion.button>
            </div>
          </form>

          {/* Query Results */}
          <div className="bg-white/5 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Bill Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    className="px-6 py-8 text-center text-gray-400"
                    colSpan={4}
                  >
                    No data available
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
