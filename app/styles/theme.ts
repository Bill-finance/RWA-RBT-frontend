import type { ThemeConfig } from "antd";
import { ConfigProvider } from "antd";

// 全局主题配置
export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: "#1890ff",
    colorSuccess: "#3f8600",
    colorWarning: "#fa8c16",
    colorError: "#cf1322",
    colorInfo: "#1890ff",
    colorTextBase: "#e5e7eb",
    colorBgBase: "#111111",
    borderRadius: 6,
  },
  components: {
    Card: {
      colorBgContainer: "#101010",
      colorBorderSecondary: "#303030",
    },
    Table: {
      colorBgContainer: "#101010",
      colorText: "#e5e7eb",
      colorTextHeading: "#f5f5f5",
      colorBgElevated: "#101010",
      colorFillAlter: "#1a1a1a",
      colorFillContent: "#1a1a1a",
      colorSplit: "#303030",
    },
    Modal: {
      colorBgElevated: "#111111",
      colorText: "#e5e7eb",
      colorTextHeading: "#f5f5f5",
      colorIcon: "#a3a3a3",
      colorSplit: "#303030",
    },
    Button: {
      colorPrimaryActive: "#096dd9",
      colorPrimaryHover: "#40a9ff",
      colorText: "#e5e7eb",
      colorBgContainer: "#1a1a1a",
      boxShadowTertiary: "none",
      boxShadow: "none !important",
      boxShadowSecondary: "none",
      controlOutline: "none",
      controlOutlineWidth: 0,
    },
    Input: {
      colorBgContainer: "#1a1a1a",
      colorText: "#e5e7eb",
      colorTextPlaceholder: "#6b7280",
    },
    Tooltip: {
      colorBgSpotlight: "#1a1a1a",
      colorTextLightSolid: "#e5e7eb",
    },
    Statistic: {
      colorText: "#e5e7eb",
      colorTextDescription: "#a3a3a3",
    },
  },
};

// 全局样式变量
export const themeColors = {
  // 背景颜色
  bgPrimary: "#101010",
  bgSecondary: "#1a1a1a",
  bgCard: "#101010",
  bgElevated: "#202020",

  // 文本颜色
  textPrimary: "#e5e7eb",
  textSecondary: "#a3a3a3",
  textDisabled: "#6b7280",

  // 边框颜色
  borderPrimary: "#303030",
  borderSecondary: "#424242",

  // 状态颜色
  success: "#3f8600",
  warning: "#fa8c16",
  error: "#cf1322",
  info: "#1890ff",

  // 特殊颜色
  highlight: "#1890ff",
  cardShadow: "rgba(0, 0, 0, 0.2)",
};

// 组件样式
export const componentStyles = {
  // 卡片样式
  card: {
    className:
      "bg-zinc-900 border border-zinc-800 rounded-lg shadow-md hover:shadow-lg transition-shadow",
    styles: {
      header: { backgroundColor: "#202020", borderBottom: "1px solid #303030" },
      body: { backgroundColor: "#101010" },
    },
  },

  // 表格样式
  table: {
    className: "text-gray-300",
    rowClassName: "hover:bg-zinc-800",
  },

  // 模态框样式
  modal: {
    className: "dark-modal",
    styles: {
      content: {
        backgroundColor: "#111111",
        color: "#e5e7eb",
        border: "1px solid #333333",
      },
      header: {
        backgroundColor: "#111111",
        borderBottom: "1px solid #333333",
        color: "#e5e7eb",
      },
      body: {
        backgroundColor: "#111111",
        color: "#e5e7eb",
      },
      footer: {
        backgroundColor: "#111111",
        borderTop: "1px solid #333333",
      },
    },
  },

  // 统计数字卡片样式
  statisticCard: {
    className:
      "bg-zinc-900 border border-zinc-800 rounded-lg shadow-md hover:shadow-lg transition-shadow",
    titleStyle: { color: "#a3a3a3" },
  },

  // 描述列表样式
  descriptions: {
    className: "bg-zinc-800 rounded text-gray-300",
    labelStyle: { color: "#a3a3a3" },
    contentStyle: { color: "#e5e7eb" },
  },

  // 按钮样式
  button: {
    primary: "bg-blue-600 hover:bg-blue-700",
    default: "bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700",
  },

  // 空状态样式
  empty: {
    description: { className: "text-gray-500" },
  },

  // 文本相关样式
  text: {
    title: { color: "#e5e7eb" },
    primary: "text-gray-200",
    secondary: "text-gray-400",
    highlight: "text-blue-400",
    success: "text-green-400",
    warning: "text-amber-400",
    error: "text-red-400",
  },

  // 图标样式
  icon: {
    primary: "text-blue-400",
    secondary: "text-gray-400",
  },
};

// 全局风格设置函数
export const setGlobalStyles = () => {
  // 添加全局 CSS 变量
  document.documentElement.style.setProperty(
    "--color-bg-primary",
    themeColors.bgPrimary
  );
  document.documentElement.style.setProperty(
    "--color-bg-secondary",
    themeColors.bgSecondary
  );
  document.documentElement.style.setProperty(
    "--color-text-primary",
    themeColors.textPrimary
  );
  document.documentElement.style.setProperty(
    "--color-text-secondary",
    themeColors.textSecondary
  );
  document.documentElement.style.setProperty(
    "--color-border-primary",
    themeColors.borderPrimary
  );

  // 应用 Ant Design 主题
  ConfigProvider.config({
    theme: darkTheme,
  });
};
