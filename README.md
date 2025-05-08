# 启动方式

## 安装 nodejs

官网下载

## 安装 pnpm 

⚠️ 注意，npm 不要和 pnpm 混用，否则容易造成依赖解析错误。

```bash
npm i pnpm -g
```

## 安装项目依赖

项目根目录下执行:

```bash
pnpm i
```

## 配置环境变量

找到根目录下的 .env 文件(没有那就创建一个，放到 .env.sample 同一级目录即可)，填入对应的链地址和id：



```txt

# Contract Addresses
# 之前的版本：NEXT_PUBLIC_CONTRACT_ADDRESS=0x8890386170F6c976Fdb781B757F9b6B66CC0Cf31
# 更新为：
NEXT_PUBLIC_CONTRACT_ADDRESS=0x3fdBBc8074978c7fd8941efB71d1a8d71327E1C1

# 合约地址https://explorer.sepolia.mantle.xyz/address/0x3fdBBc8074978c7fd8941efB71d1a8d71327E1C1

# Network Configuration
NEXT_PUBLIC_CHAIN_ID=5003   
```

## 启动项目

```bash
pnpm dev
```

然后点击终端中看到的 url，即可打开前端页面

如果遇到依赖缺失的报错，直接再用 pnpm 安装一下，再重新启动





