# RWA-RBT 主题样式系统

这个主题系统为 RWA-RBT 平台提供了一致的暗色主题样式，以符合现代 Web3 应用的设计规范。

## 目录结构

```
app/
├── styles/
│   ├── theme.ts      // 主题配置和样式变量
│   └── README.md     // 文档说明
├── components/
│   ├── ThemeProvider.tsx  // 主题提供者组件
│   └── ui/            // 封装的UI组件
│       ├── Card.tsx       // 卡片组件
│       ├── Table.tsx      // 表格组件
│       ├── Modal.tsx      // 模态框组件
│       └── StatisticCard.tsx // 统计数字卡片组件
```

## 用法

### 1. 全局主题配置

主题系统已在应用根布局中配置，所有页面都将自动应用暗色主题样式：

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <Web3Modal>
          <ThemeProvider>
            <Header />
            <main className="pt-16">{children}</main>
          </ThemeProvider>
        </Web3Modal>
      </body>
    </html>
  );
}
```

### 2. 使用封装的UI组件

使用封装的UI组件可以确保整个应用保持一致的样式：

```tsx
import Card from "@/app/components/ui/Card";
import Table from "@/app/components/ui/Table";
import Modal from "@/app/components/ui/Modal";
import StatisticCard from "@/app/components/ui/StatisticCard";

export default function MyPage() {
  return (
    <div>
      {/* 卡片组件 */}
      <Card title="My Card">
        Card content goes here
      </Card>
      
      {/* 统计数字卡片 */}
      <StatisticCard 
        title="Total Amount" 
        value={10000} 
        prefix="$" 
        precision={2} 
      />
      
      {/* 表格组件 */}
      <Card>
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
        />
      </Card>
      
      {/* 模态框组件 */}
      <Modal
        title="Detail Information"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
      >
        Modal content goes here
      </Modal>
    </div>
  );
}
```

### 3. 使用主题样式变量

如果需要直接使用主题变量，可以从 `theme.ts` 导入：

```tsx
import { themeColors, componentStyles } from "@/app/styles/theme";

export default function MyComponent() {
  return (
    <div style={{ backgroundColor: themeColors.bgPrimary }}>
      <h2 className={componentStyles.text.primary}>
        This is a heading with themed text color
      </h2>
      <p className={componentStyles.text.secondary}>
        This is a paragraph with secondary text color
      </p>
    </div>
  );
}
```

## 扩展主题

如需扩展主题样式，可以编辑 `theme.ts` 文件：

1. 添加新的颜色变量到 `themeColors` 对象
2. 添加新的组件样式配置到 `componentStyles` 对象
3. 创建新的封装组件到 `components/ui` 目录

## 颜色系统

主要颜色：

- 背景：深灰/黑色系 (`#101010`, `#1a1a1a`, `#202020`)
- 文本：白/浅灰系 (`#e5e7eb`, `#a3a3a3`)
- 边框：灰色系 (`#303030`, `#424242`)
- 强调色：蓝色系 (`#1890ff`) 
- 功能色：
  - 成功：绿色 (`#3f8600`)
  - 警告：橙色 (`#fa8c16`)
  - 错误：红色 (`#cf1322`)
  - 信息：蓝色 (`#1890ff`) 