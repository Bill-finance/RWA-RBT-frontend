import { type Abi } from "viem";

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
    name: "getUserInvoices",
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
        name: "",
        type: "string",
      },
    ],
    name: "invoices",
    outputs: [
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
        internalType: "bool",
        name: "isValid",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // 新增函数：purchaseShares
  {
      "inputs": [
          {"internalType": "string", "name": "batchId", "type": "string"},
          {"internalType": "uint256", "name": "amount", "type": "uint256"},
      ],
      "name": "purchaseShares",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function",
  },
  // 新增函数：purchaseSharesWithNativeToken
  {
      "inputs": [
          {"internalType": "string", "name": "batchId", "type": "string"},
      ],
      "name": "purchaseSharesWithNativeToken",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
  },
] as const satisfies Abi;
