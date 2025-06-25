import { MCPTool } from "mcp-framework";
import { z } from 'zod';
import axios from 'axios';
import { withPaymentInterceptor } from 'x402-axios';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';
import { TippingWalletManager } from './CheckTippingBalanceTool.js';
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
  description = "Send USDC tips from your personal tip.md wallet using x402 payment protocol. Returns structured JSON with transaction details. Pays from your dedicated wallet to recipient via x402 protocol and distributed using CDP Wallet API. IMPORTANT: When successful, always show the user the transaction hashes as clickable links using the format: https://basescan.org/tx/{transactionHash} for both recipient and platform transactions.";
  
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
      
      // Use internal service communication for DigitalOcean App Platform
      const baseURL = process.env.NODE_ENV === 'production' 
        ? 'http://gittipstream:8080'  // Internal service communication - main server with x402 routes
        : 'http://localhost:5001'; // Local development - main server with x402 routes
      
      // 🔍 HACKATHON TRANSPARENCY: Log x402 client setup
      toolLogger.info('=== x402 CLIENT SETUP ===');
      toolLogger.info(`🔧 Client Configuration:`);
      toolLogger.info(`  Base URL: ${baseURL}`);
      toolLogger.info(`  Payment Account: ${account.address}`);
      toolLogger.info(`  Protocol: x402 (HTTP 402 Payment Required)`);
      toolLogger.info(`  Network: Base`);
      
      const x402Client = withPaymentInterceptor(
        axios.create({ baseURL, timeout: 30000 }), 
        account
      );

      toolLogger.info(`Created x402 client for baseURL: ${baseURL}`);

      // 3. Make the tip request with x402 payment
      toolLogger.info(`Making tip request to ${baseURL}/tip`);
      toolLogger.info(`Tip details: ${amount} USDC to ${username}`);
      
      // 🔍 HACKATHON TRANSPARENCY: Log x402 payment attempt
      toolLogger.info('=== x402 PAYMENT PROTOCOL EXECUTION ===');
      toolLogger.info(`💸 Payment Request:`);
      toolLogger.info(`  Recipient: ${username}`);
      toolLogger.info(`  Amount: ${amount} USDC`);
      toolLogger.info(`  Sender: ${tipMdUserId}`);
      toolLogger.info(`  Protocol: HTTP 402 Payment Required`);
      toolLogger.info(`📡 Initiating x402 payment request...`);

      const response = await x402Client.post('/tip', {
        recipientUsername: username,
        recipientAddress: recipientUser.ethereumAddress,
        tipAmount: Math.floor(amount * 1000000), // Convert to microUSDC
        message: `Tip from ${tipMdUserId}`,
        senderName: tipMdUserId
      });

      // 🔍 HACKATHON TRANSPARENCY: Log x402 payment success
      toolLogger.info('=== x402 PAYMENT SUCCESS ===');
      toolLogger.info(`✅ Payment Protocol: HTTP 402 completed successfully`);
      toolLogger.info(`✅ Payment Verified: ${amount} USDC payment accepted`);
      toolLogger.info(`✅ Service Delivered: Tip distribution completed`);
      
      if (response.data.x402Protocol) {
        toolLogger.info(`📋 x402 Protocol Details:`);
        toolLogger.info(`  Version: ${response.data.x402Protocol.protocolVersion}`);
        toolLogger.info(`  Payment Method: ${response.data.x402Protocol.paymentMethod}`);
        toolLogger.info(`  Network: ${response.data.x402Protocol.network}`);
        toolLogger.info(`  Amount Verified: ${response.data.x402Protocol.paymentAmount}`);
      }

      toolLogger.info(`Tip successful: ${JSON.stringify(response.data, null, 2)}`);

      // 4. Save the tip to database now that payment succeeded
      const { recipient, transactions, amounts } = response.data;
      
      try {
        // Use the MCP server's database connection to save the tip
        // @ts-ignore - JS module import in standalone repo
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
        message: `Tip sent successfully! ${amounts.total} USDC sent to ${username} via x402 protocol. Recipient transaction: https://basescan.org/tx/${transactions.recipient} | Platform fee transaction: https://basescan.org/tx/${transactions.platform}`
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