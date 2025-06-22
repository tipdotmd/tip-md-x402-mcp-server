import { MCPTool } from "mcp-framework";
import { z } from 'zod';
import axios from 'axios';
import { withPaymentInterceptor } from 'x402-axios';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';
import { TippingWalletManager } from './CheckTippingBalanceTool.js';
import { isStandaloneMode } from '../utils/environment.js';
import { createDemoUser, createDemoTipResult, logDemoOperation } from '../utils/demoResponses.js';
// @ts-ignore
import { userRepository } from '../../../mcp-server/database/userRepository.js';

dotenv.config();

const TipUserSchema = z.object({
  tipMdUserId: z.string().describe("Your tip.md user ID (to identify your wallet for sending)"),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 
    'Username must contain only alphanumeric characters, underscores, and hyphens'),
  amount: z.number().min(0.01).describe("Amount in USDC to tip (minimum 0.01)")
});

type TipUserParams = z.infer<typeof TipUserSchema>;

interface TipResult {
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
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  message: string;
}

// Local logger for this tool
const toolLogger = {
  info: (...args: any[]) => console.log('[TipUserX402Tool]', ...args),
  error: (...args: any[]) => console.error('[TipUserX402Tool ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[TipUserX402Tool WARN]', ...args),
  debug: (...args: any[]) => console.debug('[TipUserX402Tool DEBUG]', ...args)
};

export default class TipUserX402Tool extends MCPTool<TipUserParams> {
  name = "tip_user_x402";
  description = "Send USDC tips from your personal tip.md wallet using x402 payment protocol. Returns structured JSON with transaction details. Pays from your dedicated wallet to recipient via x402 protocol and distributed using CDP Wallet API.";
  
  schema = {
    tipMdUserId: {
      type: z.string(),
      description: "Your tip.md user ID (to identify your wallet for sending)"
    },
    username: {
      type: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 
        'Username must contain only alphanumeric characters, underscores, and hyphens'),
      description: "Username of the tip.md user to tip"
    },
    amount: {
      type: z.number().min(0.01),
      description: "Amount in USDC to tip (minimum 0.01)"
    }
  };

  constructor() {
    super();
  }

  async execute(input: TipUserParams): Promise<TipResult> {
    try {
      const { tipMdUserId, username, amount } = input;
      
      toolLogger.info(`Processing x402 tip: ${amount} USDC from ${tipMdUserId} to ${username}`);
      
      // Check if we're in standalone mode (demo)
      if (isStandaloneMode()) {
        toolLogger.info('Running in standalone/demo mode');
        
        // Basic validation
        if (amount < 0.01) {
          const result: TipResult = {
            success: false,
            operation: "x402_tip_demo",
            error: {
              code: "INVALID_AMOUNT",
              message: "Minimum tip amount is 0.01 USDC",
              details: `Requested amount: ${amount} USDC`
            },
            message: "Demo: Tip failed due to invalid amount"
          };
          return result;
        }
        
        // Return demo response
        const demoResult = createDemoTipResult(tipMdUserId, username, amount);
        logDemoOperation('x402_tip', { tipMdUserId, username, amount });
        return demoResult;
      }
      
      // Validate amount
      if (amount < 0.01) {
        const result: TipResult = {
          success: false,
          operation: "x402_tip",
          error: {
            code: "INVALID_AMOUNT",
            message: "Minimum tip amount is 0.01 USDC",
            details: `Requested amount: ${amount} USDC`
          },
          message: "Tip failed due to invalid amount"
        };
        return result;
      }

      // Check if recipient user exists in database before attempting x402 payment
      const recipientUser = await userRepository.getUserByUsername(username);
      if (!recipientUser) {
        const result: TipResult = {
          success: false,
          operation: "x402_tip",
          error: {
            code: "USER_NOT_FOUND",
            message: "Recipient user not found",
            details: `Username '${username}' needs to sign up at tip.md first`
          },
          message: "Tip failed due to user not found"
        };
        return result;
      }

      toolLogger.info(`Recipient user found: ${username} (ID: ${recipientUser.id})`);

      // Check if recipient has wallet configured
      const hasEthWallet = recipientUser.ethereumAddress && recipientUser.ethereumAddress.trim() !== '';
      if (!hasEthWallet) {
        const result: TipResult = {
          success: false,
          operation: "x402_tip",
          error: {
            code: "RECIPIENT_WALLET_NOT_CONNECTED",
            message: "Recipient wallet not connected",
            details: `Username '${username}' needs to connect their wallet at tip.md to receive tips`
          },
          message: "Tip failed due to recipient wallet not connected"
        };
        return result;
      }

      // 1. Load user's dedicated tipping wallet
      let walletData;
      try {
        walletData = await TippingWalletManager.getWalletData(tipMdUserId);
      } catch (error) {
        const result: TipResult = {
          success: false,
          operation: "x402_tip",
          error: {
            code: "WALLET_NOT_FOUND",
            message: "No tipping wallet found for user",
            details: `User ID: ${tipMdUserId}. Please create a wallet first using the check_tipping_balance tool.`
          },
          message: "Tip failed due to missing wallet"
        };
        return result;
      }

      toolLogger.info(`Loaded wallet for user: ${tipMdUserId}, address: ${walletData.address}`);

      // 2. Create x402 payment client with user's private key
      const account = privateKeyToAccount(walletData.privateKey as `0x${string}`);
      
      // Use the main server port (integrated x402 routes)
      const MAIN_SERVER_PORT = parseInt(process.env.PORT || '5001', 10);
      const baseURL = process.env.NODE_ENV === 'production' 
        ? `http://localhost:${MAIN_SERVER_PORT}`  // Internal communication - main server with x402 routes
        : `http://localhost:${MAIN_SERVER_PORT}`; // Local development - main server with x402 routes
      
      const x402Client = withPaymentInterceptor(
        axios.create({ baseURL, timeout: 30000 }), 
        account
      );

      toolLogger.info(`Created x402 client for baseURL: ${baseURL}`);

      // 3. Make x402 payment to protected endpoint
      toolLogger.info(`Sending x402 payment: ${amount} USDC to ${username} (${recipientUser.ethereumAddress})`);
      
      const response = await x402Client.post('/tip', {
        recipientUsername: username,
        recipientAddress: recipientUser.ethereumAddress, // Use the saved Ethereum address
        tipAmount: Math.floor(amount * 1000000), // Convert to microUSDC (6 decimals)
        message: 'x402 tip via MCP server',
        senderName: 'MCP Agent'
      });

      toolLogger.info(`x402 payment successful:`, response.data);

      // 4. Save the tip to database now that payment succeeded
      const { recipient, transactions, amounts } = response.data;
      
      try {
        // Use the MCP server's database connection to save the tip
        const { getDb } = await import('../../database/connection.js');
        const db = await getDb();
        
        // Get the recipient user to get their ID for the tip record
        const recipientUser = await userRepository.getUserByUsername(username);
        if (!recipientUser) {
          throw new Error(`Recipient user ${username} not found for database save`);
        }
        
        // Generate a numeric ID for the tip (following the same pattern as main storage)
        const lastTip = await db.collection("tips").findOne({}, { sort: { id: -1 } });
        const newId = (lastTip?.id || 0) + 1;
        
        const tipData = {
          id: newId,
          userId: recipientUser.id, // Use the user's numeric ID
          amount: amounts.total.toString(),
          message: 'x402 tip via MCP server',
          senderName: 'MCP Agent',
          blockchain: 'base',
          token: 'USDC',
          usdValue: amounts.total.toString(),
          transactionHash: transactions.recipient, // Use recipient transfer hash as primary
          platformFee: amounts.platformFee.toString(),
          platformFeePercentage: "4",
          status: 'confirmed',
          createdAt: new Date(),
          // Set other nullable fields to null
          senderAvatar: null,
          appId: null,
          appName: null,
          appIconUrl: null,
          recipientType: null
        };
        
        await db.collection("tips").insertOne(tipData);
        toolLogger.info(`Tip saved to database: ${amounts.total} USDC to ${username} (tip ID: ${newId})`);
      } catch (dbError) {
        toolLogger.error('Failed to save tip to database:', dbError);
        // Don't fail the entire operation - payment succeeded, just log the DB error
      }

      // 5. Return success message with transaction details
      const result: TipResult = {
        success: true,
        operation: "x402_tip",
        data: {
          senderUserId: tipMdUserId,
          recipientUsername: username,
          amounts: {
            total: amounts.total,
            recipient: amounts.recipient,
            platformFee: amounts.platformFee,
            platformFeePercentage: 4
          },
          network: "base",
          protocol: "x402",
          transactions: {
            recipient: transactions.recipient,
            platform: transactions.platform
          },
          timestamp: new Date().toISOString()
        },
        message: "Tip sent successfully - paid via x402 protocol and distributed using CDP Wallet API"
      };
      
      return result;

    } catch (error: any) {
      toolLogger.error(`Error in x402 tip:`, error);
      
      // Handle x402-specific errors
      if (error.response?.status === 402) {
        const errorData = error.response.data;
        toolLogger.warn('x402 Payment Required error:', errorData);
        
        if (errorData.error?.includes('insufficient') || errorData.error?.includes('balance')) {
          const walletAddress = await this.getWalletAddress(input.tipMdUserId);
          const result: TipResult = {
            success: false,
            operation: "x402_tip",
            error: {
              code: "INSUFFICIENT_FUNDS",
              message: "Insufficient USDC balance for tip",
              details: `Wallet: ${walletAddress}, Required: ${input.amount} USDC, Network: Base Mainnet`
            },
            message: "Tip failed due to insufficient funds"
          };
          return result;
        }
        
        const result: TipResult = {
          success: false,
          operation: "x402_tip",
          error: {
            code: "X402_PAYMENT_FAILED",
            message: "x402 payment verification failed",
            details: errorData.error || 'Payment verification failed'
          },
          message: "Tip failed due to x402 payment error"
        };
        return result;
      }
      
      // Handle network/connection errors
      if (error.code === 'ECONNREFUSED') {
        const result: TipResult = {
          success: false,
          operation: "x402_tip",
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "x402 payment server not accessible",
            details: "Please try again later"
          },
          message: "Tip failed due to service unavailability"
        };
        return result;
      }
      
      // Handle user not found errors
      if (error.response?.status === 404) {
        const result: TipResult = {
          success: false,
          operation: "x402_tip",
          error: {
            code: "USER_NOT_FOUND",
            message: "Recipient user not found",
            details: `Username '${input.username}' needs to sign up at tip.md first`
          },
          message: "Tip failed due to user not found"
        };
        return result;
      }
      
      // Handle recipient wallet errors
      if (error.response?.status === 400 && error.response?.data?.error?.includes('Ethereum address')) {
        const result: TipResult = {
          success: false,
          operation: "x402_tip",
          error: {
            code: "RECIPIENT_WALLET_NOT_CONNECTED",
            message: "Recipient wallet not connected",
            details: `Username '${input.username}' needs to connect their wallet at tip.md to receive tips`
          },
          message: "Tip failed due to recipient wallet not connected"
        };
        return result;
      }

      // Generic error fallback
      const result: TipResult = {
        success: false,
        operation: "x402_tip",
        error: {
          code: "TRANSACTION_FAILED",
          message: "Transaction failed",
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        message: "Tip failed due to transaction error"
      };
      return result;
    }
  }

  private async getWalletAddress(tipMdUserId: string): Promise<string> {
    try {
      const walletData = await TippingWalletManager.getWalletData(tipMdUserId);
      return walletData.address;
    } catch {
      return 'wallet address not found';
    }
  }
} 