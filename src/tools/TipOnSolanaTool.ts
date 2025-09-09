import { MCPTool } from "mcp-framework";
import { z } from 'zod';
import axios from 'axios';
import { withPaymentInterceptor, createSigner } from 'x402-axios';
import dotenv from 'dotenv';
import { TippingWalletManager } from './CheckTippingBalanceTool.js';
// @ts-ignore
import { userRepository } from '../../../mcp-server/database/userRepository.js';

dotenv.config();

const TipOnSolanaSchema = z.object({
  tipMdUserId: z.string().describe("Your tip.md user ID (to identify your wallet for sending)"),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 
    'Username must contain only alphanumeric characters, underscores, and hyphens'),
  amount: z.number().min(0.01).describe("Amount in USDC to tip (minimum 0.01)")
});

type TipOnSolanaParams = z.infer<typeof TipOnSolanaSchema>;

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
  info: (...args: any[]) => console.log('[TipOnSolanaTool]', ...args),
  error: (...args: any[]) => console.error('[TipOnSolanaTool ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[TipOnSolanaTool WARN]', ...args),
  debug: (...args: any[]) => console.debug('[TipOnSolanaTool DEBUG]', ...args)
};

export default class TipOnSolanaTool extends MCPTool<TipOnSolanaParams> {
  name = "tip_on_solana";
  description = "Send USDC tips on Solana from your personal tip.md wallet using the x402 payment protocol. Returns structured JSON with transaction details. IMPORTANT: When successful, always show the user the transaction hashes as clickable links using the format: https://solscan.io/tx/{transactionHash} for both recipient and platform transactions..";
  
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

  async execute(input: TipOnSolanaParams): Promise<TipResult> {
    try {
      const { tipMdUserId, username, amount } = input;
      
      toolLogger.info(`Processing Solana tip: ${amount} USDC from ${tipMdUserId} to ${username}`);
      
      // Validate amount
      if (amount < 0.01) {
        const result: TipResult = {
          success: false,
          operation: "solana_tip",
          error: {
            code: "INVALID_AMOUNT",
            message: "Minimum tip amount is 0.01 USDC",
            details: `Requested amount: ${amount} USDC`
          },
          message: "Tip failed due to invalid amount"
        };
        return result;
      }

      // Check if recipient user exists in database before attempting payment
      const recipientUser = await userRepository.getUserByUsername(username);
      if (!recipientUser) {
        const result: TipResult = {
          success: false,
          operation: "solana_tip",
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

      // Check if recipient has Solana wallet configured
      const hasSolanaWallet = recipientUser.solanaAddress && recipientUser.solanaAddress.trim() !== '';
      if (!hasSolanaWallet) {
        const result: TipResult = {
          success: false,
          operation: "solana_tip",
          error: {
            code: "RECIPIENT_WALLET_NOT_CONNECTED",
            message: "Recipient Solana wallet not connected",
            details: `Username '${username}' needs to connect their Solana wallet at tip.md to receive tips`
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
          operation: "solana_tip",
          error: {
            code: "WALLET_NOT_FOUND",
            message: "No tipping wallet found for user",
            details: `User ID: ${tipMdUserId}. Please create a wallet first using the check_tipping_balance tool.`
          },
          message: "Tip failed due to missing wallet"
        };
        return result;
      }

      if (!walletData.solanaPrivateKeyBase58) {
        const result: TipResult = {
          success: false,
          operation: "solana_tip",
          error: {
            code: "MISSING_SOLANA_KEY",
            message: "No Solana private key found for this wallet",
            details: `User ID: ${tipMdUserId}`
          },
          message: "Tip failed due to missing Solana private key"
        };
        return result;
      }

      toolLogger.info(`Loaded wallet for user: ${tipMdUserId}, solana address: ${walletData.solanaAddress}`);

      // 2. Create x402 payment client with user's Solana private key signer
      const account = await createSigner("solana", walletData.solanaPrivateKeyBase58 as string);
      
      const baseURL = process.env.NODE_ENV === 'production' 
        ? 'http://localhost:5001'
        : 'http://localhost:5001';
      
      toolLogger.info('=== x402 CLIENT SETUP (Solana) ===');
      toolLogger.info(`  Base URL: ${baseURL}`);
      toolLogger.info(`  Protocol: x402 (HTTP 402 Payment Required)`);
      toolLogger.info(`  Network: Solana`);
      
      const x402Client = withPaymentInterceptor(
        axios.create({ baseURL, timeout: 30000 }),
        account
      );

      toolLogger.info(`Created x402 client for baseURL: ${baseURL}`);

      // 3. Make the tip request with x402 payment
      toolLogger.info(`Making tip request to ${baseURL}/tip-solana`);
      toolLogger.info(`Tip details: ${amount} USDC to ${username}`);
      toolLogger.info('=== x402 PAYMENT PROTOCOL EXECUTION (Solana) ===');

      const response = await x402Client.post('/tip-solana', {
        recipientUsername: username,
        recipientAddress: recipientUser.solanaAddress,
        tipAmount: Math.floor(amount * 1000000),
        message: `Tip from ${tipMdUserId}`,
        senderName: tipMdUserId
      });

      toolLogger.info('=== x402 PAYMENT SUCCESS (Solana) ===');
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
      const { transactions, amounts } = response.data;
      
      try {
        // Use the MCP server's database connection to save the tip
        // @ts-ignore - JS module import in standalone repo
        const { getDb } = await import('../../../mcp-server/database/connection.js');
        const db = await getDb();
        
        const recipientUserRef = await userRepository.getUserByUsername(username);
        if (!recipientUserRef) {
          throw new Error(`Recipient user ${username} not found for database save`);
        }
        
        const lastTip = await db.collection("tips").findOne({}, { sort: { id: -1 } });
        const newId = (lastTip?.id || 0) + 1;
        
        const tipData = {
          id: newId,
          userId: recipientUserRef.id,
          amount: amounts.total.toString(),
          message: 'Solana tip via MCP server (x402 verified)',
          senderName: 'MCP Agent',
          blockchain: 'solana',
          token: 'USDC',
          usdValue: amounts.total.toString(),
          transactionHash: transactions.recipient,
          platformFee: amounts.platformFee.toString(),
          platformFeePercentage: "4",
          status: 'confirmed',
          createdAt: new Date(),
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
      }

      // 5. Return success message with transaction details
      const result: TipResult = {
        success: true,
        operation: "solana_tip",
        data: {
          senderUserId: tipMdUserId,
          recipientUsername: username,
          amounts: {
            total: amounts.total,
            recipient: amounts.recipient,
            platformFee: amounts.platformFee,
            platformFeePercentage: 4
          },
          network: "solana",
          protocol: "x402",
          transactions: {
            recipient: transactions.recipient,
            platform: transactions.platform
          },
          timestamp: new Date().toISOString()
        },
        message: `Tip sent successfully on Solana! ${amounts.total} USDC sent to ${username} via x402 protocol. Recipient transaction: https://basescan.org/tx/${transactions.recipient} | Platform fee transaction: https://basescan.org/tx/${transactions.platform}`
      };
      
      return result;

    } catch (error: any) {
      toolLogger.error(`Error in Solana tip:`, error);
      
      if (error.response?.status === 402) {
        const errorData = error.response.data;
        toolLogger.warn('x402 Payment Required error:', errorData);
        
        const result: TipResult = {
          success: false,
          operation: "solana_tip",
          error: {
            code: "X402_PAYMENT_FAILED",
            message: "x402 payment verification failed",
            details: errorData.error || 'Payment verification failed'
          },
          message: "Tip failed due to x402 payment error"
        };
        return result;
      }
      
      if (error.code === 'ECONNREFUSED') {
        const result: TipResult = {
          success: false,
          operation: "solana_tip",
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "x402 payment server not accessible",
            details: "Please try again later"
          },
          message: "Tip failed due to service unavailability"
        };
        return result;
      }
      
      if (error.response?.status === 404) {
        const result: TipResult = {
          success: false,
          operation: "solana_tip",
          error: {
            code: "USER_NOT_FOUND",
            message: "Recipient user not found",
            details: `Username '${input.username}' needs to sign up at tip.md first`
          },
          message: "Tip failed due to user not found"
        };
        return result;
      }
      
      if (error.response?.status === 400 && error.response?.data?.error?.includes('Solana address')) {
        const result: TipResult = {
          success: false,
          operation: "solana_tip",
          error: {
            code: "RECIPIENT_WALLET_NOT_CONNECTED",
            message: "Recipient wallet not connected",
            details: `Username '${input.username}' needs to connect their wallet at tip.md to receive tips`
          },
          message: "Tip failed due to recipient wallet not connected"
        };
        return result;
      }

      const result: TipResult = {
        success: false,
        operation: "solana_tip",
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
}


