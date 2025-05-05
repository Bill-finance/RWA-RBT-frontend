# Invoice.sol ABI 文档

## 功能概述

Invoice.sol 是一个票据管理智能合约，主要功能包括：

1. 票据管理

    - 创建和管理票据
    - 票据打包成批次
    - 票据查询和验证

2. 投资功能

    - 购买票据份额
    - 使用稳定币或原生代币投资
    - 投资人取款

3. 还款功能

    - 债务人还款
    - 支持稳定币和原生代币还款

4. 权限管理
    - 合约升级
    - 暂停/恢复合约
    - 票据作废

## 前端交互指南

### 1. 合约初始化

```javascript
// 使用 ethers.js
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const invoiceContract = new ethers.Contract(CONTRACT_ADDRESS, INVOICE_ABI, signer);
```

### 2. 主要功能实现

#### 2.1 票据管理

##### 创建票据

```javascript
// 批量创建票据
async function createInvoices(invoices) {
    const tx = await invoiceContract.batchCreateInvoices(invoices);
    await tx.wait();
    return tx.hash;
}

// 监听票据创建事件
invoiceContract.on(
    "InvoiceCreated",
    (invoiceNumber, payee, payer, amount, ipfsHash, contractHash, dueDate, timestamp) => {
        console.log("New invoice created:", {
            invoiceNumber,
            payee,
            payer,
            amount: amount.toString(),
            ipfsHash,
            contractHash,
            dueDate: new Date(dueDate * 1000),
            timestamp: new Date(timestamp * 1000),
        });
    }
);
```

##### 创建批次

```javascript
// 创建票据打包批次
async function createBatch(batchId, invoiceNumbers, minTerm, maxTerm, interestRate) {
    const tx = await invoiceContract.createTokenBatch(
        batchId,
        invoiceNumbers,
        minTerm,
        maxTerm,
        interestRate
    );
    await tx.wait();
    return tx.hash;
}

// 监听批次创建事件
invoiceContract.on(
    "TokenBatchCreated",
    (batchId, payee, payer, totalAmount, minTerm, maxTerm, interestRate) => {
        console.log("New batch created:", {
            batchId,
            payee,
            payer,
            totalAmount: totalAmount.toString(),
            minTerm: minTerm.toString(),
            maxTerm: maxTerm.toString(),
            interestRate: interestRate.toString(),
        });
    }
);
```

##### 确认发行批次

```javascript
// 确认发行批次
async function confirmBatchIssue(batchId) {
    const tx = await invoiceContract.confirmTokenBatchIssue(batchId);
    await tx.wait();
    return tx.hash;
}

// 监听批次发行事件
invoiceContract.on("TokenBatchIssued", (batchId, payee, totalAmount) => {
    console.log("Batch issued:", {
        batchId,
        payee,
        totalAmount: totalAmount.toString(),
    });
});
```

#### 2.2 投资功能

##### 购买份额（稳定币）

```javascript
// 使用稳定币购买份额
async function purchaseShares(batchId, amount) {
    const tx = await invoiceContract.purchaseShares(batchId, amount);
    await tx.wait();
    return tx.hash;
}

// 监听购买事件
invoiceContract.on("SharePurchased", (batchId, investor, amount) => {
    console.log("Shares purchased:", {
        batchId,
        investor,
        amount: amount.toString(),
    });
});
```

##### 购买份额（原生代币）

```javascript
// 使用原生代币购买份额
async function purchaseSharesWithNativeToken(batchId, amount) {
    const tx = await invoiceContract.purchaseSharesWithNativeToken(batchId, {
        value: amount,
    });
    await tx.wait();
    return tx.hash;
}

// 监听原生代币购买事件
invoiceContract.on("NativeSharePurchased", (batchId, investor, amount) => {
    console.log("Shares purchased with native token:", {
        batchId,
        investor,
        amount: amount.toString(),
    });
});
```

##### 取款

```javascript
// 普通取款
async function withdraw(amount) {
    const tx = await invoiceContract.withdraw(amount);
    await tx.wait();
    return tx.hash;
}

// 使用 ERC20Permit 取款
async function withdrawWithPermit(amount, deadline, v, r, s) {
    const tx = await invoiceContract.withdrawWithPermit(amount, deadline, v, r, s);
    await tx.wait();
    return tx.hash;
}
```

#### 2.3 还款功能

##### 还款（稳定币）

```javascript
// 使用稳定币还款
async function repayInvoice(invoiceNumber, amount) {
    const tx = await invoiceContract.repayInvoice(invoiceNumber, amount);
    await tx.wait();
    return tx.hash;
}

// 监听还款事件
invoiceContract.on("InvoiceRepaid", (invoiceNumber, payer, amount) => {
    console.log("Invoice repaid:", {
        invoiceNumber,
        payer,
        amount: amount.toString(),
    });
});
```

##### 还款（原生代币）

```javascript
// 使用原生代币还款
async function repayInvoiceWithNativeToken(invoiceNumber, amount) {
    const tx = await invoiceContract.repayInvoiceWithNativeToken(invoiceNumber, {
        value: amount,
    });
    await tx.wait();
    return tx.hash;
}

// 监听原生代币还款事件
invoiceContract.on("NativeInvoiceRepaid", (invoiceNumber, payer, amount) => {
    console.log("Invoice repaid with native token:", {
        invoiceNumber,
        payer,
        amount: amount.toString(),
    });
});
```

#### 2.4 查询功能

##### 查询票据

```javascript
// 获取单个票据信息
async function getInvoice(invoiceNumber) {
    const invoice = await invoiceContract.getInvoice(invoiceNumber);
    return {
        invoiceNumber: invoice.invoiceNumber,
        payee: invoice.payee,
        payer: invoice.payer,
        amount: invoice.amount.toString(),
        ipfsHash: invoice.ipfsHash,
        contractHash: invoice.contractHash,
        timestamp: new Date(invoice.timestamp * 1000),
        dueDate: new Date(invoice.dueDate * 1000),
        isCleared: invoice.isCleared,
        isValid: invoice.isValid,
    };
}

// 获取收款人的所有票据（分页）
async function getPayeeInvoices(payee, offset, limit) {
    const invoices = await invoiceContract.getPayeeInvoices(payee, offset, limit);
    return invoices.map((invoice) => ({
        invoiceNumber: invoice.invoiceNumber,
        payee: invoice.payee,
        payer: invoice.payer,
        amount: invoice.amount.toString(),
        ipfsHash: invoice.ipfsHash,
        contractHash: invoice.contractHash,
        timestamp: new Date(invoice.timestamp * 1000),
        dueDate: new Date(invoice.dueDate * 1000),
        isCleared: invoice.isCleared,
        isValid: invoice.isValid,
    }));
}
```

### 3. 错误处理

```javascript
try {
    const tx = await invoiceContract.purchaseShares(batchId, amount);
    await tx.wait();
} catch (error) {
    if (error.message.includes("Invoice__InsufficientBalance")) {
        console.error("余额不足");
    } else if (error.message.includes("Invoice__BatchNotIssued")) {
        console.error("批次未发行");
    } else {
        console.error("交易失败:", error);
    }
}
```

### 4. 注意事项

1. 交易确认

    - 所有写操作都需要等待交易确认
    - 建议显示交易进度和确认状态

2. 事件监听

    - 建议在组件卸载时移除事件监听
    - 使用 `off` 方法取消特定事件的监听

3. 错误处理

    - 处理常见的错误情况
    - 提供用户友好的错误提示

4. 状态管理

    - 使用状态管理工具（如 Redux）管理合约状态
    - 定期更新合约数据

5. 性能优化
    - 批量查询时使用分页
    - 缓存常用数据
    - 使用 WebSocket 监听事件

## ABI 结构

### 构造函数

```json
{
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
}
```

### 事件定义

#### 票据相关事件

```json
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "string",
            "name": "invoiceNumber",
            "type": "string"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "payee",
            "type": "address"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "payer",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "string",
            "name": "ipfsHash",
            "type": "string"
        },
        {
            "indexed": false,
            "internalType": "string",
            "name": "contractHash",
            "type": "string"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "dueDate",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
        }
    ],
    "name": "InvoiceCreated",
    "type": "event"
}
```

#### 批次相关事件

```json
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "string",
            "name": "batchId",
            "type": "string"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "payee",
            "type": "address"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "payer",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "totalAmount",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "minTerm",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "maxTerm",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "interestRate",
            "type": "uint256"
        }
    ],
    "name": "TokenBatchCreated",
    "type": "event"
}
```

### 主要函数

#### 创建票据

```json
{
    "inputs": [
        {
            "components": [
                {
                    "internalType": "string",
                    "name": "invoiceNumber",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "payee",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "payer",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "ipfsHash",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "contractHash",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "dueDate",
                    "type": "uint256"
                }
            ],
            "internalType": "struct Invoice.InvoiceData[]",
            "name": "_invoices",
            "type": "tuple[]"
        }
    ],
    "name": "batchCreateInvoices",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}
```

#### 购买份额

```json
{
    "inputs": [
        {
            "internalType": "string",
            "name": "_batchId",
            "type": "string"
        },
        {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
        }
    ],
    "name": "purchaseShares",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}
```

## 主要接口

### 票据管理

-   `batchCreateInvoices`: 批量创建票据
-   `createTokenBatch`: 创建票据打包批次
-   `confirmTokenBatchIssue`: 确认发行票据打包批次
-   `invalidateInvoice`: 作废票据

### 投资功能

-   `purchaseShares`: 使用稳定币购买份额
-   `purchaseSharesWithNativeToken`: 使用原生代币购买份额
-   `withdraw`: 投资人取款
-   `withdrawWithPermit`: 使用 ERC20Permit 取款

### 还款功能

-   `repayInvoice`: 使用稳定币还款
-   `repayInvoiceWithNativeToken`: 使用原生代币还款

### 查询功能

-   `getInvoice`: 获取票据信息
-   `getTokenBatch`: 获取批次信息
-   `getUserBatches`: 获取用户的所有批次
-   `getPayeeInvoices`: 获取用户的所有票据
-   `queryInvoices`: 查询票据
-   `getBatchSoldAmount`: 获取批次已售出金额

### 管理功能

-   `pause`: 暂停合约
-   `unpause`: 恢复合约
-   `_authorizeUpgrade`: 授权合约升级

## 函数详细说明

### 1. batchCreateInvoices

```json
{
    "inputs": [
        {
            "components": [
                {
                    "internalType": "string",
                    "name": "invoiceNumber",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "payee",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "payer",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "ipfsHash",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "contractHash",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "dueDate",
                    "type": "uint256"
                }
            ],
            "internalType": "struct Invoice.InvoiceData[]",
            "name": "_invoices",
            "type": "tuple[]"
        }
    ],
    "name": "batchCreateInvoices",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}
```

相关事件：

```json
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "string",
            "name": "invoiceNumber",
            "type": "string"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "payee",
            "type": "address"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "payer",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "string",
            "name": "ipfsHash",
            "type": "string"
        },
        {
            "indexed": false,
            "internalType": "string",
            "name": "contractHash",
            "type": "string"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "dueDate",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
        }
    ],
    "name": "InvoiceCreated",
    "type": "event"
}
```

说明：

-   用于批量创建票据
-   需要提供完整的票据信息数组
-   每个票据必须包含发票号、收款人、付款人、金额、IPFS 哈希、合同哈希和到期日
-   创建成功后会触发 InvoiceCreated 事件

### 2. createTokenBatch

```json
{
    "inputs": [
        {
            "internalType": "string",
            "name": "_batchId",
            "type": "string"
        },
        {
            "internalType": "string[]",
            "name": "_invoiceNumbers",
            "type": "string[]"
        },
        {
            "internalType": "uint256",
            "name": "_minTerm",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "_maxTerm",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "_interestRate",
            "type": "uint256"
        }
    ],
    "name": "createTokenBatch",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}
```

相关事件：

```json
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "string",
            "name": "batchId",
            "type": "string"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "payee",
            "type": "address"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "payer",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "totalAmount",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "minTerm",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "maxTerm",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "interestRate",
            "type": "uint256"
        }
    ],
    "name": "TokenBatchCreated",
    "type": "event"
}
```

说明：

-   用于创建票据打包批次
-   需要提供批次 ID、票据号数组、最小期限、最大期限和利率
-   创建成功后会触发 TokenBatchCreated 事件

### 3. confirmTokenBatchIssue

```json
{
    "inputs": [
        {
            "internalType": "string",
            "name": "_batchId",
            "type": "string"
        }
    ],
    "name": "confirmTokenBatchIssue",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}
```

相关事件：

```json
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "string",
            "name": "batchId",
            "type": "string"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "payee",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "totalAmount",
            "type": "uint256"
        }
    ],
    "name": "TokenBatchIssued",
    "type": "event"
}
```

说明：

-   用于确认发行票据打包批次
-   需要提供批次 ID
-   确认成功后会触发 TokenBatchIssued 事件

### 4. purchaseShares

```json
{
    "inputs": [
        {
            "internalType": "string",
            "name": "_batchId",
            "type": "string"
        },
        {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
        }
    ],
    "name": "purchaseShares",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}
```

相关事件：

```json
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "string",
            "name": "batchId",
            "type": "string"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "investor",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        }
    ],
    "name": "SharePurchased",
    "type": "event"
}
```

说明：

-   用于使用稳定币购买份额
-   需要提供批次 ID 和购买金额
-   购买成功后会触发 SharePurchased 事件

### 5. purchaseSharesWithNativeToken

```json
{
    "inputs": [
        {
            "internalType": "string",
            "name": "_batchId",
            "type": "string"
        }
    ],
    "name": "purchaseSharesWithNativeToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
}
```

相关事件：

```json
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "string",
            "name": "batchId",
            "type": "string"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "investor",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        }
    ],
    "name": "NativeSharePurchased",
    "type": "event"
}
```

说明：

-   用于使用原生代币购买份额
-   需要提供批次 ID，金额通过 msg.value 传递
-   购买成功后会触发 NativeSharePurchased 事件

### 6. withdraw

```json
{
    "inputs": [
        {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
        }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}
```

说明：

-   用于投资人取款
-   需要提供取款金额
-   只能提取已到期的投资金额

### 7. withdrawWithPermit

```json
{
    "inputs": [
        {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "_deadline",
            "type": "uint256"
        },
        {
            "internalType": "uint8",
            "name": "_v",
            "type": "uint8"
        },
        {
            "internalType": "bytes32",
            "name": "_r",
            "type": "bytes32"
        },
        {
            "internalType": "bytes32",
            "name": "_s",
            "type": "bytes32"
        }
    ],
    "name": "withdrawWithPermit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}
```

说明：

-   使用 ERC20Permit 进行取款
-   需要提供取款金额、截止时间、签名参数
-   可以避免提前授权，提高用户体验

### 8. repayInvoice

```json
{
    "inputs": [
        {
            "internalType": "string",
            "name": "_invoiceNumber",
            "type": "string"
        },
        {
            "internalType": "uint256",
            "name": "_amount",
            "type": "uint256"
        }
    ],
    "name": "repayInvoice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}
```

相关事件：

```json
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "string",
            "name": "invoiceNumber",
            "type": "string"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "payer",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        }
    ],
    "name": "InvoiceRepaid",
    "type": "event"
}
```

说明：

-   用于使用稳定币还款
-   需要提供发票号和还款金额
-   还款成功后会触发 InvoiceRepaid 事件

### 9. repayInvoiceWithNativeToken

```json
{
    "inputs": [
        {
            "internalType": "string",
            "name": "_invoiceNumber",
            "type": "string"
        }
    ],
    "name": "repayInvoiceWithNativeToken",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
}
```

相关事件：

```json
{
    "anonymous": false,
    "inputs": [
        {
            "indexed": true,
            "internalType": "string",
            "name": "invoiceNumber",
            "type": "string"
        },
        {
            "indexed": true,
            "internalType": "address",
            "name": "payer",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
        }
    ],
    "name": "NativeInvoiceRepaid",
    "type": "event"
}
```

说明：

-   用于使用原生代币还款
-   需要提供发票号，金额通过 msg.value 传递
-   还款成功后会触发 NativeInvoiceRepaid 事件

### 10. getPayeeInvoices

```json
{
    "inputs": [
        {
            "internalType": "address",
            "name": "_payee",
            "type": "address"
        },
        {
            "internalType": "uint256",
            "name": "_offset",
            "type": "uint256"
        },
        {
            "internalType": "uint256",
            "name": "_limit",
            "type": "uint256"
        }
    ],
    "name": "getPayeeInvoices",
    "outputs": [
        {
            "components": [
                {
                    "internalType": "string",
                    "name": "invoiceNumber",
                    "type": "string"
                },
                {
                    "internalType": "address",
                    "name": "payee",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "payer",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "internalType": "string",
                    "name": "ipfsHash",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "contractHash",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "timestamp",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "dueDate",
                    "type": "uint256"
                },
                {
                    "internalType": "bool",
                    "name": "isCleared",
                    "type": "bool"
                },
                {
                    "internalType": "bool",
                    "name": "isValid",
                    "type": "bool"
                }
            ],
            "internalType": "struct Invoice.InvoiceData[]",
            "name": "",
            "type": "tuple[]"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}
```

说明：

-   用于获取收款人的所有票据
-   需要提供收款人地址、偏移量和限制数量
-   返回票据数据数组，包含完整的票据信息
-   支持分页查询
