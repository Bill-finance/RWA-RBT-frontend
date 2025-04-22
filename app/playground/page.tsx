"use client";

import { useState } from "react";
import AnimatedSection from "../components/AnimatedSection";
import Input from "../components/formComponents/Input";
import DatePicker from "../components/formComponents/DatePicker";
import FileUpload from "../components/formComponents/FileUpload";
import Select from "../components/formComponents/Select";
import { motion } from "framer-motion";

const statusOptions = [
  { value: "all", label: "全部" },
  { value: "pending", label: "待清算" },
  { value: "completed", label: "已清算" },
];

export default function PlaygroundPage() {
  const [formData, setFormData] = useState({
    payer: "",
    amount: "",
    billNumber: "",
    billDate: new Date(),
    billImage: null as File | null,
  });

  const [queryData, setQueryData] = useState({
    billNumber: "",
    status: statusOptions[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Query submitted:", queryData);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* 票据上链表单 */}
        <AnimatedSection threshold={0.1}>
          <h1 className="text-3xl font-bold mb-8">票据上链</h1>

          {/* 基本信息 */}
          <div className="mb-8">
            <h2 className="text-xl text-gray-400 mb-4">基本信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="还款方"
                placeholder="请输入账户地址"
                value={formData.payer}
                onChange={(e) =>
                  setFormData({ ...formData, payer: e.target.value })
                }
              />
              <Input
                label="金额"
                prefix="¥"
                type="number"
                placeholder="请输入金额"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </div>
          </div>

          {/* 票据信息 */}
          <div className="mb-8">
            <h2 className="text-xl text-gray-400 mb-4">票据信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <Input
                  label="票据编号"
                  placeholder="请输入票据编号"
                  value={formData.billNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, billNumber: e.target.value })
                  }
                />
                <DatePicker
                  label="票据日期"
                  value={formData.billDate}
                  onChange={(date) =>
                    setFormData({ ...formData, billDate: date })
                  }
                />
              </div>
              <FileUpload
                label="票据图片"
                accept="image/jpeg,image/png"
                maxSize={5 * 1024 * 1024}
                onFileSelect={(file) =>
                  setFormData({ ...formData, billImage: file })
                }
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 text-blue-400 hover:text-blue-300"
              onClick={() => console.log("Add more bills")}
            >
              + 添加票据
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              批量上链
            </motion.button>
          </div>
        </AnimatedSection>

        {/* 票据查询 */}
        <AnimatedSection className="mt-16" threshold={0.1}>
          <h2 className="text-2xl font-bold mb-6">票据查询</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Input
              placeholder="请输入票据编号"
              value={queryData.billNumber}
              onChange={(e) =>
                setQueryData({ ...queryData, billNumber: e.target.value })
              }
            />
            <Select
              options={statusOptions}
              value={queryData.status}
              onChange={(option) =>
                setQueryData({ ...queryData, status: option })
              }
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleQuery}
              className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              查询
            </motion.button>
          </div>

          {/* 查询结果表格 */}
          <div className="bg-white/5 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    票据编号
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    金额
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    清算状态
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    className="px-6 py-8 text-center text-gray-400"
                    colSpan={4}
                  >
                    暂无数据
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
