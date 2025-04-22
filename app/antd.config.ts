import { ConfigProvider } from "antd";
import { ReactNode } from "react";

interface AntdProviderProps {
  children: ReactNode;
}

export const AntdProvider = ({ children }: AntdProviderProps) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#3b82f6",
          colorError: "#ef4444",
          colorText: "#ffffff",
          colorTextSecondary: "#9ca3af",
          colorBgContainer: "rgba(255, 255, 255, 0.05)",
          colorBorder: "rgba(255, 255, 255, 0.1)",
          borderRadius: 8,
          controlHeight: 40,
        },
        components: {
          Input: {
            colorBgContainer: "rgba(255, 255, 255, 0.05)",
            colorBorder: "rgba(255, 255, 255, 0.1)",
            activeBorderColor: "#3b82f6",
            hoverBorderColor: "#3b82f6",
          },
          Select: {
            colorBgContainer: "rgba(255, 255, 255, 0.05)",
            colorBorder: "rgba(255, 255, 255, 0.1)",
            colorText: "#ffffff",
            colorTextPlaceholder: "#9ca3af",
          },
          DatePicker: {
            colorBgContainer: "rgba(255, 255, 255, 0.05)",
            colorBorder: "rgba(255, 255, 255, 0.1)",
            colorText: "#ffffff",
          },
          Upload: {
            colorBgContainer: "rgba(255, 255, 255, 0.05)",
            colorBorder: "rgba(255, 255, 255, 0.1)",
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};
