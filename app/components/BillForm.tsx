"use client";

import { Form } from "antd";
import Input from "./formComponents/Input";
import DatePicker from "./formComponents/DatePicker";
import FileUpload from "./formComponents/FileUpload";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

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
  const [form] = Form.useForm<BillFormData>();
  const isFirstRender = useRef(true);

  // 当表单值更改时提交到父组件
  const handleValuesChange = (
    _: Record<string, unknown>,
    allValues: BillFormData
  ) => {
    if (onSubmit && !isFirstRender.current) {
      onSubmit(allValues);
    }
  };

  // 仅在组件首次挂载时设置表单初始值
  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData as BillFormData);
    }
    // 标记初始渲染已完成
    isFirstRender.current = false;

    // 清理函数
    return () => {
      isFirstRender.current = true;
    };
  }, []); // 仅在挂载时运行一次

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

      <Form
        form={form}
        initialValues={initialData}
        onValuesChange={handleValuesChange}
        layout="vertical"
        className="space-y-6"
      >
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="payer"
            rules={[{ required: true, message: "Please enter payer address" }]}
          >
            <Input label="Payer" placeholder="Enter account address" />
          </Form.Item>
          <Form.Item
            name="amount"
            rules={[
              { required: true, message: "Please enter amount" },
              {
                pattern: /^\d+(\.\d{1,2})?$/,
                message: "Please enter a valid amount",
              },
            ]}
          >
            <Input label="Amount" prefix="¥" placeholder="Enter amount" />
          </Form.Item>
        </div>

        {/* Bill Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Form.Item
              name="billNumber"
              rules={[{ required: true, message: "Please enter bill number" }]}
            >
              <Input label="Bill Number" placeholder="Enter bill number" />
            </Form.Item>
            <Form.Item
              name="billDate"
              initialValue={new Date()}
              rules={[{ required: true, message: "Please select bill date" }]}
            >
              <DatePicker label="Bill Date" />
            </Form.Item>
          </div>
          <Form.Item
            name="billImage"
            rules={[{ required: false, message: "Please upload bill image" }]}
          >
            <FileUpload
              label="Bill Image (Optional)"
              accept="image/jpeg,image/png"
              maxSize={5 * 1024 * 1024}
            />
          </Form.Item>
        </div>
      </Form>
    </motion.div>
  );
}
