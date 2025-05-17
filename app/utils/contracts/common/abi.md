# Invoice Contract ABI

## 合约概述

Invoice 合约是一个用于管理票据的智能合约，支持票据的创建、打包、发行和交易等功能。

## 主要功能

### 初始化

-   `initialize(address _vaultAddress, address _rbtAddress)`: 初始化合约，设置 Vault 和 RBT Token 地址

### 票据管理

-   `batchCreateInvoices(InvoiceData[] _invoices)`: 批量创建票据
-   `invalidateInvoice(string _invoiceNumber)`: 作废票据
-   `getInvoice(string _invoiceNumber, bool _checkValid)`: 获取票据信息
-   `getPayeeInvoices(address _user)`: 获取用户的所有票据编号
-   `queryInvoices(QueryParams params)`: 查询票据

### 批次管理

-   `createTokenBatch(string _batchId, string[] _invoiceNumbers, address _stableToken, uint256 _minTerm, uint256 _maxTerm, uint256 _interestRate)`: 创建票据打包批次
-   `confirmTokenBatchIssue(string _batchId)`: 确认发行票据打包批次
-   `getTokenBatch(string _batchId)`: 获取批次信息
-   `getUserBatches(address _user)`: 获取用户的所有批次 ID
-   `getBatchSoldAmount(string _batchId)`: 获取批次已售出金额

### 交易功能

-   `purchaseShares(string _batchId, uint256 _amount)`: 购买份额
-   `purchaseSharesWithNativeToken(string _batchId)`: 使用原生代币购买份额
-   `repayInvoice(string _batchId, uint256 _amount)`: 债务人使用稳定币还款
-   `repayInvoiceWithNativeToken(string _batchId)`: 债务人使用原生代币还款

### 投资人功能

-   `withdrawWithPermit(uint256 amount, address token, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`: 使用 ERC20Permit 取款
-   `withdraw(uint256 amount, address token)`: 使用 approve 取款

### 管理功能

-   `pause()`: 暂停合约
-   `unpause()`: 恢复合约

## 数据结构

### InvoiceData

```solidity
struct InvoiceData {
    string invoiceNumber;    // 票据编号
    address payee;          // 债权人地址
    address payer;          // 债务人地址
    uint256 amount;         // 金额
    string ipfsHash;        // 票据图片IPFS哈希
    string contractHash;    // 合同图片IPFS哈希
    uint256 timestamp;      // 登记日期
    uint256 dueDate;        // 到期日
    string tokenBatch;      // token批次编码
    bool isCleared;         // 是否已清算
    bool isValid;           // 是否有效
}
```

### InvoiceTokenBatch

```solidity
struct InvoiceTokenBatch {
    string batchId;         // 批次ID
    address payee;          // 债权人地址
    address payer;          // 债务人地址
    address stableToken;    // 还款稳定币地址
    uint256 minTerm;        // 最短期限(月)
    uint256 maxTerm;        // 最长期限(月)
    uint256 interestRate;   // 年化利率
    uint256 totalAmount;    // 发行总额
    uint256 issueDate;      // 发行日期
    bool isSigned;          // 是否已签名
    bool isIssued;          // 是否已发行
    string[] invoiceNumbers; // 包含的票据编号
}
```

### QueryParams

```solidity
struct QueryParams {
    string batchId;         // 批次ID
    address payer;          // 债务人地址
    address payee;          // 债权人地址
    string invoiceNumber;   // 票据编号
    bool checkValid;        // 是否检查有效性
}
```

### QueryResult

```solidity
struct QueryResult {
    InvoiceData[] invoices; // 票据数组
    uint256 total;         // 总数
}
```

## 事件

-   `InvoiceCreated`: 票据创建事件
-   `InvoiceInvalidated`: 票据作废事件
-   `ContractUpgraded`: 合约升级事件
-   `TokenBatchCreated`: 批次创建事件
-   `TokenBatchIssued`: 批次发行事件
-   `SharePurchased`: 份额购买事件
-   `NativeSharePurchased`: 原生代币份额购买事件
-   `InvoiceRepaid`: 票据还款事件
-   `NativeInvoiceRepaid`: 原生代币票据还款事件
-   `InvestorWithdrawn`: 投资人取款事件

## 错误

-   `Invoice__InvalidInvoiceNumber`: 无效的票据编号
-   `Invoice__InvoiceAlreadyExists`: 票据已存在
-   `Invoice__InvoiceNotFound`: 票据不存在
-   `Invoice__Unauthorized`: 未授权
-   `Invoice__InvalidAmount`: 无效金额
-   `Invoice__InvalidDueDate`: 无效到期日
-   `Invoice__EmptyBatch`: 空批次
-   `Invoice__InvalidBatchId`: 无效批次 ID
-   `Invoice__BatchAlreadyExists`: 批次已存在
-   `Invoice__BatchNotFound`: 批次不存在
-   `Invoice__InvalidTerm`: 无效期限
-   `Invoice__InvalidInterestRate`: 无效利率
-   `Invoice__InvalidInvoices`: 无效票据
-   `Invoice__UnauthorizedPayer`: 未授权的付款人
-   `Invoice__BatchAlreadyIssued`: 批次已发行
-   `Invoice__InvalidVaultAddress`: 无效的 Vault 地址
-   `Invoice__InvalidRBTAddress`: 无效的 RBT 地址
-   `Invoice__BatchNotIssued`: 批次未发行
-   `Invoice__InsufficientBalance`: 余额不足
-   `Invoice__TransferFailed`: 转账失败
-   `Invoice__UnauthorizedRepayment`: 未授权的还款
-   `InvalidAmount`: 无效金额
-   `InvalidInvestor`: 无效投资人
-   `InvalidSignature`: 无效签名
-   `SignatureExpired`: 签名过期
