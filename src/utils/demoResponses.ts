/**
 * Demo responses for standalone mode
 * These simulate the x402 + CDP flow for hackathon demonstration
 */

export interface DemoUser {
  id: number;
  username: string;
  ethereumAddress: string;
}

export interface DemoTipResult {
  success: boolean;
  operation: string;
  data?: {
    senderUserId: string;
    recipientUsername: string;
    amounts: {
      total: number;
      recipient: number;
      platformFee: number;
      platformFeePercentage: number;
    };
    network: string;
    protocol: string;
    transactions: {
      recipient: string;
      platform: string;
    };
    timestamp: string;
  };
  message: string;
}

export const createDemoUser = (username: string): DemoUser => ({
  id: Math.floor(Math.random() * 1000),
  username,
  ethereumAddress: `0x${Math.random().toString(16).substr(2, 40)}`
});

export const createDemoTipResult = (
  senderUserId: string,
  username: string,
  amount: number
): DemoTipResult => {
  const platformFee = amount * 0.04;
  const recipientAmount = amount - platformFee;
  
  return {
    success: true,
    operation: "x402_tip_demo",
    data: {
      senderUserId,
      recipientUsername: username,
      amounts: {
        total: amount,
        recipient: recipientAmount,
        platformFee,
        platformFeePercentage: 4
      },
      network: "base",
      protocol: "x402",
      transactions: {
        recipient: `0x${Math.random().toString(16).substr(2, 64)}`,
        platform: `0x${Math.random().toString(16).substr(2, 64)}`
      },
      timestamp: new Date().toISOString()
    },
    message: `🏆 DEMO: Would tip ${amount} USDC to ${username} via x402 + CDP (96% to recipient, 4% platform fee)`
  };
};

export const createDemoBalanceResponse = (userId: string) => ({
  success: true,
  operation: "check_balance_demo",
  data: {
    userId,
    address: `0x${Math.random().toString(16).substr(2, 40)}`,
    balance: 50.25, // Demo balance
    network: "base",
    isNewWallet: false,
    timestamp: new Date().toISOString()
  },
  message: "🏆 DEMO: Simulated wallet balance (fund this address with USDC for real tipping)"
});

export const createDemoWalletInfo = (userId: string) => ({
  success: true,
  operation: "wallet_info_demo",
  data: {
    userId,
    address: `0x${Math.random().toString(16).substr(2, 40)}`,
    balance: 50.25,
    network: "base",
    created: new Date().toISOString(),
    txCount: 5
  },
  message: "🏆 DEMO: Simulated tipping wallet (in production, this would be your dedicated CDP wallet)"
});

export const logDemoOperation = (operation: string, details: any) => {
  console.log(`[DEMO MODE] ${operation}:`, JSON.stringify(details, null, 2));
}; 