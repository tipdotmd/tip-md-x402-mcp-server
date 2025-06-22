import { MCPTool } from "mcp-framework";
import { z } from 'zod';
import { ethers } from 'ethers';
import { CdpClient } from '@coinbase/cdp-sdk';
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
    transactionHash: string;
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

// Local logger for this tool
const toolLogger = {
  info: (...args: any[]) => console.log('[WithdrawTippingFundsTool]', ...args),
  error: (...args: any[]) => console.error('[WithdrawTippingFundsTool ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[WithdrawTippingFundsTool WARN]', ...args),
  debug: (...args: any[]) => console.debug('[WithdrawTippingFundsTool DEBUG]', ...args)
};

export default class WithdrawTippingFundsTool extends MCPTool<WithdrawTippingFundsParams> {
  name = "withdraw_tipping_funds";
  description = "Withdraw USDC from your tipping wallet to any Ethereum address. Returns structured JSON with transaction details. Requires your tip.md user ID. Base network only.";
  
  schema = WithdrawSchema;

  constructor() {
    super();
  }

  private validateEnvironment(): void {
    const required = ['CDP_API_KEY_ID', 'CDP_API_KEY_SECRET'];
    const missing = required.filter(env => !process.env[env]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required CDP environment variables: ${missing.join(', ')}`);
    }
  }

  async execute(params: WithdrawTippingFundsParams, context?: { sessionId?: string }): Promise<WithdrawResult> {
    try {
      const sessionId = context?.sessionId;
      toolLogger.info(`[Withdraw Tool] Processing withdrawal for session: ${sessionId || 'default'}`);

      // Validate environment variables
      this.validateEnvironment();

      // Use the provided tip.md user ID
      const userId = params.tipMdUserId;
      toolLogger.info(`[Withdraw Tool] Using tip.md user ID: ${userId}`);

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
        return result;
      }
      
      // Get current balance
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
        return result;
      }
      
      // Validate withdrawal amount
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
        return result;
      }

      toolLogger.info(`[Withdraw Tool] Initiating withdrawal: ${withdrawAmount} USDC from ${wallet.address} to ${destinationAddress}`);

      // Initialize CDP client and execute withdrawal
      const cdpClient = new CdpClient();
      
      // Get CDP account for user's wallet address
      // Note: This assumes the user's wallet is managed by CDP or accessible via CDP
      let userCdpAccount;
      try {
        userCdpAccount = await cdpClient.evm.getAccount({ address: wallet.address as `0x${string}` });
        toolLogger.info(`[Withdraw Tool] Successfully loaded CDP account: ${userCdpAccount.address}`);
      } catch (error) {
        toolLogger.error(`[Withdraw Tool] Failed to load CDP account for address ${wallet.address}:`, error);
        
        const result: WithdrawResult = {
          success: false,
          operation: "withdrawal",
          error: {
            code: "CDP_ACCOUNT_ERROR",
            message: "Failed to access CDP account for withdrawal",
            details: `Cannot access CDP account for wallet ${wallet.address}. The wallet may not be managed by CDP.`
          },
          message: "Withdrawal failed due to CDP account access error"
        };
        return result;
      }

      // Execute the withdrawal transfer using CDP SDK
      toolLogger.info(`[Withdraw Tool] Executing CDP transfer: ${withdrawAmount} USDC to ${destinationAddress}`);
      
      const withdrawalTransfer = await userCdpAccount.transfer({
        to: destinationAddress as `0x${string}`,
        amount: BigInt(Math.floor(withdrawAmount * 1000000)), // Convert USDC to microUSDC (6 decimals)
        token: "usdc",
        network: "base"
      });

      toolLogger.info(`[Withdraw Tool] Withdrawal completed successfully!`);
      toolLogger.info(`[Withdraw Tool] Transaction hash: ${withdrawalTransfer.transactionHash}`);

      // Update last used timestamp
      await TippingWalletManager.updateLastUsed(userId);
      
      // Calculate remaining balance
      const remainingBalance = Number((balance - withdrawAmount).toFixed(2));
      
      const result: WithdrawResult = {
        success: true,
        operation: "withdrawal",
        data: {
          userId: userId,
          amount: withdrawAmount,
          destinationAddress: destinationAddress,
          network: "base",
          sourceAddress: wallet.address,
          transactionHash: withdrawalTransfer.transactionHash,
          remainingBalance: remainingBalance,
          estimatedConfirmation: "2-5 minutes",
          timestamp: new Date().toISOString()
        },
        message: "Withdrawal completed successfully"
      };
      
      toolLogger.info(`[Withdraw Tool] Withdrawal result:`, result);
      
      return result;

    } catch (error: any) {
      toolLogger.error('[Withdraw Tool] Error during withdrawal:', error);
      
      const result: WithdrawResult = {
        success: false,
        operation: "withdrawal",
        error: {
          code: error.name || "SYSTEM_ERROR",
          message: "Unexpected error during withdrawal",
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        message: "Withdrawal failed due to system error"
      };
      
      return result;
    }
  }
} 