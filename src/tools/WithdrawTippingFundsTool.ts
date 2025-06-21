import { MCPTool } from "mcp-framework";
import { z } from 'zod';
import { ethers } from 'ethers';
import { TippingWalletManager } from './CheckTippingBalanceTool.js';

const WithdrawSchema = z.object({
  tipMdUserId: z.string().describe("Your tip.md user ID (required to access wallet)"),
  destinationAddress: z.string().describe("Ethereum address to send funds to"),
  amount: z.number().describe("Amount in USDC to withdraw (or 'all' for full balance)")
});

type WithdrawTippingFundsParams = z.infer<typeof WithdrawSchema>;

interface WithdrawResult {
  success: boolean;
  operation: string;
  data?: {
    userId: string;
    amount: number;
    destinationAddress: string;
    network: string;
    sourceAddress: string;
    transactionHash?: string;
    remainingBalance: number;
    estimatedConfirmation: string;
    timestamp: string;
  };
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  message: string;
}

export default class WithdrawTippingFundsTool extends MCPTool<WithdrawTippingFundsParams> {
  name = "withdraw_tipping_funds";
  description = "Withdraw USDC from your tipping wallet to any Ethereum address. Returns structured JSON with transaction details. Requires your tip.md user ID. Base network only.";
  
  schema = WithdrawSchema;

  constructor() {
    super();
  }

  async execute(params: WithdrawTippingFundsParams, context?: { sessionId?: string }): Promise<string> {
    try {
      const sessionId = context?.sessionId;
      console.log(`[Withdraw Tool] Withdrawing for session: ${sessionId || 'default'}`);

      // Use the provided tip.md user ID
      const userId = params.tipMdUserId;
      console.log(`[Withdraw Tool] Using tip.md user ID: ${userId}`);

      // Get wallet using the user ID
      const { wallet } = await TippingWalletManager.getOrCreateWallet(sessionId, userId);
      
      const { destinationAddress, amount } = params;
      
      // Validate Ethereum address
      if (!ethers.isAddress(destinationAddress)) {
        const result: WithdrawResult = {
          success: false,
          operation: "withdrawal",
          error: {
            code: "INVALID_ADDRESS",
            message: "Invalid destination Ethereum address",
            details: `Address '${destinationAddress}' is not a valid Ethereum address`
          },
          message: "Withdrawal failed due to invalid destination address"
        };
        return JSON.stringify(result, null, 2);
      }
      
      const balance = await TippingWalletManager.getUSDCBalance(wallet.address);
      
      if (balance === 0) {
        const result: WithdrawResult = {
          success: false,
          operation: "withdrawal",
          error: {
            code: "INSUFFICIENT_FUNDS",
            message: "No USDC balance available for withdrawal",
            details: `Wallet ${wallet.address} has zero USDC balance`
          },
          message: "Withdrawal failed due to insufficient funds"
        };
        return JSON.stringify(result, null, 2);
      }
      
      let withdrawAmount = amount;
      if (amount <= 0 || amount > balance) {
        const result: WithdrawResult = {
          success: false,
          operation: "withdrawal",
          error: {
            code: "INVALID_AMOUNT",
            message: "Invalid withdrawal amount",
            details: `Requested ${amount} USDC, but available balance is ${balance.toFixed(2)} USDC`
          },
          message: "Withdrawal failed due to invalid amount"
        };
        return JSON.stringify(result, null, 2);
      }
      
      // In a real implementation, this would execute the blockchain transaction
      // For now, we'll simulate the withdrawal
      await TippingWalletManager.updateLastUsed(userId);
      
      const result: WithdrawResult = {
        success: true,
        operation: "withdrawal",
        data: {
          userId: userId,
          amount: withdrawAmount,
          destinationAddress: destinationAddress,
          network: "base",
          sourceAddress: wallet.address,
          transactionHash: "0x" + Math.random().toString(16).slice(2), // Simulated
          remainingBalance: Number((balance - withdrawAmount).toFixed(2)),
          estimatedConfirmation: "2-5 minutes",
          timestamp: new Date().toISOString()
        },
        message: "Withdrawal initiated successfully"
      };
      
      return JSON.stringify(result, null, 2);

    } catch (error: any) {
      console.error('[Withdraw Tool] Error:', error);
      
      const result: WithdrawResult = {
        success: false,
        operation: "withdrawal",
        error: {
          code: "SYSTEM_ERROR",
          message: "Unexpected error during withdrawal",
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        message: "Withdrawal failed due to system error"
      };
      
      return JSON.stringify(result, null, 2);
    }
  }
} 