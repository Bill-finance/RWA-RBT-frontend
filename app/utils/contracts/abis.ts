// ABI for the token contract
export const getTokenABI = () => {
  return [
    {
      inputs: [
        {
          internalType: "string",
          name: "tokenId",
          type: "string",
        },
        {
          internalType: "string",
          name: "batchId",
          type: "string",
        },
        {
          internalType: "string",
          name: "amount",
          type: "string",
        },
        {
          internalType: "string",
          name: "maturityDate",
          type: "string",
        },
        {
          internalType: "string",
          name: "interestRate",
          type: "string",
        },
      ],
      name: "createToken",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "tokenId",
          type: "string",
        },
      ],
      name: "getTokenDetails",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "id",
              type: "string",
            },
            {
              internalType: "string",
              name: "batchId",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "amount",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "maturityDate",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "interestRate",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "exists",
              type: "bool",
            },
          ],
          internalType: "struct RWAToken.Token",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
};
