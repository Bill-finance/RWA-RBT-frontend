import { type Abi } from "viem";

export interface BaseContractProps {
  onSuccess?: <T>(data: T) => void;
  onError?: (error: Error) => void;
  onLoading?: (loading: boolean) => void;
}

export interface InvoiceData {
  invoice_number: string;
  payee: `0x${string}`;
  payer: `0x${string}`;
  amount: string;
  ipfs_hash: string;
  contract_hash?: string;
  timestamp: string;
  due_date: string;
  token_batch?: string;
  is_cleared: boolean;
  is_valid: boolean;
}

export const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "invoiceNumber",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payee",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "string",
        name: "ipfsHash",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "contractHash",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "dueDate",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "InvoiceCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "invoiceNumber",
        type: "string",
      },
    ],
    name: "InvoiceInvalidated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "batchId",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payee",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minTerm",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "maxTerm",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "interestRate",
        type: "uint256",
      },
    ],
    name: "TokenBatchCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "batchId",
        type: "string",
      },
    ],
    name: "TokenBatchIssued",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "batchId",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "SharePurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "batchId",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "NativeSharePurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "batchId",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "InvoiceRepaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "string",
        name: "batchId",
        type: "string",
      },
      {
        indexed: true,
        internalType: "address",
        name: "payer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "NativeInvoiceRepaid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "investor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
    ],
    name: "InvestorWithdrawn",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_batchId",
        type: "string",
      },
      {
        internalType: "string[]",
        name: "_invoiceNumbers",
        type: "string[]",
      },
      {
        internalType: "address",
        name: "_stableToken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_minTerm",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_maxTerm",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_interestRate",
        type: "uint256",
      },
    ],
    name: "createTokenBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_batchId",
        type: "string",
      },
    ],
    name: "confirmTokenBatchIssue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_batchId",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "purchaseShares",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_batchId",
        type: "string",
      },
    ],
    name: "purchaseSharesWithNativeToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_batchId",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "repayInvoice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_batchId",
        type: "string",
      },
    ],
    name: "repayInvoiceWithNativeToken",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "withdrawWithPermit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_invoiceNumber",
        type: "string",
      },
    ],
    name: "invalidateInvoice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "unpause",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_batchId",
        type: "string",
      },
    ],
    name: "getTokenBatch",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "batchId",
            type: "string",
          },
          {
            internalType: "address",
            name: "payee",
            type: "address",
          },
          {
            internalType: "address",
            name: "payer",
            type: "address",
          },
          {
            internalType: "address",
            name: "stableToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "minTerm",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxTerm",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "interestRate",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalAmount",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "issueDate",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isSigned",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isIssued",
            type: "bool",
          },
          {
            internalType: "string[]",
            name: "invoiceNumbers",
            type: "string[]",
          },
        ],
        internalType: "struct Invoice.InvoiceTokenBatch",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getUserBatches",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_invoiceNumber",
        type: "string",
      },
      {
        internalType: "bool",
        name: "_checkValid",
        type: "bool",
      },
    ],
    name: "getInvoice",
    outputs: [
      {
        components: [
          {
            internalType: "string",
            name: "invoiceNumber",
            type: "string",
          },
          {
            internalType: "address",
            name: "payee",
            type: "address",
          },
          {
            internalType: "address",
            name: "payer",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "ipfsHash",
            type: "string",
          },
          {
            internalType: "string",
            name: "contractHash",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "dueDate",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "tokenBatch",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isCleared",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isValid",
            type: "bool",
          },
        ],
        internalType: "struct Invoice.InvoiceData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
    ],
    name: "getPayeeInvoices",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "batchId",
            type: "string",
          },
          {
            internalType: "address",
            name: "payer",
            type: "address",
          },
          {
            internalType: "address",
            name: "payee",
            type: "address",
          },
          {
            internalType: "string",
            name: "invoiceNumber",
            type: "string",
          },
          {
            internalType: "bool",
            name: "checkValid",
            type: "bool",
          },
        ],
        internalType: "struct Invoice.QueryParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "queryInvoices",
    outputs: [
      {
        components: [
          {
            components: [
              {
                internalType: "string",
                name: "invoiceNumber",
                type: "string",
              },
              {
                internalType: "address",
                name: "payee",
                type: "address",
              },
              {
                internalType: "address",
                name: "payer",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "ipfsHash",
                type: "string",
              },
              {
                internalType: "string",
                name: "contractHash",
                type: "string",
              },
              {
                internalType: "uint256",
                name: "timestamp",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "dueDate",
                type: "uint256",
              },
              {
                internalType: "string",
                name: "tokenBatch",
                type: "string",
              },
              {
                internalType: "bool",
                name: "isCleared",
                type: "bool",
              },
              {
                internalType: "bool",
                name: "isValid",
                type: "bool",
              },
            ],
            internalType: "struct Invoice.InvoiceData[]",
            name: "invoices",
            type: "tuple[]",
          },
          {
            internalType: "uint256",
            name: "total",
            type: "uint256",
          },
        ],
        internalType: "struct Invoice.QueryResult",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_batchId",
        type: "string",
      },
    ],
    name: "getBatchSoldAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "string",
            name: "invoiceNumber",
            type: "string",
          },
          {
            internalType: "address",
            name: "payee",
            type: "address",
          },
          {
            internalType: "address",
            name: "payer",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "ipfsHash",
            type: "string",
          },
          {
            internalType: "string",
            name: "contractHash",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "dueDate",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "tokenBatch",
            type: "string",
          },
          {
            internalType: "bool",
            name: "isCleared",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "isValid",
            type: "bool",
          },
        ],
        internalType: "struct Invoice.InvoiceData[]",
        name: "_invoices",
        type: "tuple[]",
      },
    ],
    name: "batchCreateInvoices",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const as Abi;
