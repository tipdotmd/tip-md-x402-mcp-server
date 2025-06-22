import { MCPTool } from "mcp-framework";
import { z } from 'zod';
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { isStandaloneMode } from '../utils/environment.js';
import { createDemoBalanceResponse, createDemoWalletInfo } from '../utils/demoResponses.js';

const CheckTippingBalanceSchema = z.object({
  tipMdUserId: z.string().optional().describe("Your existing tip.md user ID (leave empty for new users)")
});

type CheckTippingBalanceParams = z.infer<typeof CheckTippingBalanceSchema>;

interface BalanceCheckResult {
  success: boolean;
  operation: string;
  data?: {
    userId: string;
    address: string;
    balance: number;
    network: string;
    isNewWallet: boolean;
    privateKey?: string; // Only included for new wallets
    timestamp: string;
  };
  setup?: {
    instructions: string[];
    warnings: string[];
  };
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  message: string;
}

// Import storage for database operations
let storage: any = null;

async function getStorage() {
  if (!storage) {
    // In standalone mode, we don't have access to main project storage
    // This is expected for the hackathon demo repo
    console.log('[CheckTippingBalanceTool] Running in standalone mode - using local wallet files');
    return null;
  }
  return storage;
}

// Hybrid wallet manager - uses database for session mapping, files for private keys
class TippingWalletManager {
  private static walletCache = new Map<string, ethers.HDNodeWallet | ethers.Wallet>();

  static getWalletDir(): string {
    // Server-side storage for wallet files (private keys)
    return path.join(process.cwd(), 'mcp-server', 'wallets');
  }

  static getWalletPath(userId: string): string {
    return path.join(this.getWalletDir(), `${userId}_tipping.json`);
  }

  // Generate cryptographically secure unique user ID
  static generateSecureUserId(): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    const clientInfo = `${timestamp}_${random}`;
    const hash = crypto.createHash('sha256').update(clientInfo).digest('hex');
    return `tip.md_user_${hash.substring(0, 16)}`;
  }

  // Get or create persistent user ID based on secure generation
  static async getPersistentUserId(sessionId?: string): Promise<string> {
    try {
      // For first-time users, we'll generate a new secure ID
      // For returning users, they'll need to provide their existing ID
      // This approach ensures cryptographic uniqueness
      
      console.log('[Wallet Manager] Generating new secure user ID...');
      const userId = this.generateSecureUserId();
      console.log(`[Wallet Manager] Generated secure user ID: ${userId}`);
      return userId;
    } catch (error) {
      console.error('[Wallet Manager] Error generating user ID:', error);
      // Fallback with timestamp to ensure uniqueness
      const fallbackId = `tip.md_user_fallback_${Date.now()}`;
      return fallbackId;
    }
  }

  static async getOrCreateWallet(sessionId?: string, userId?: string): Promise<{
    wallet: ethers.HDNodeWallet | ethers.Wallet;
    isNewWallet: boolean;
    privateKey?: string;
  }> {
    try {
      // Ensure wallet directory exists
      const walletDir = this.getWalletDir();
      if (!fs.existsSync(walletDir)) {
        fs.mkdirSync(walletDir, { recursive: true });
      }

      // Get persistent user ID from database mapping
      if (!userId) {
        userId = await this.getPersistentUserId(sessionId);
      }
      const walletPath = this.getWalletPath(userId);
      
      // Check if wallet file already exists for this user
      if (fs.existsSync(walletPath)) {
        const data = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
        const wallet = new ethers.Wallet(data.privateKey);
        console.log(`[Wallet Manager] Loaded existing wallet for user: ${userId}`);
        
        // Update last used timestamp in file
        await this.updateLastUsed(userId);
        
        return {
          wallet,
          isNewWallet: false,
          privateKey: data.privateKey
        };
      } else {
        // Generate new wallet
        const wallet = ethers.Wallet.createRandom();
        
        // Save wallet data to file (private key stays in filesystem)
        const walletData = {
          address: wallet.address,
          privateKey: wallet.privateKey,
          userId: userId,
          sessionId: sessionId, // Keep for reference
          created: new Date().toISOString(),
          lastUsed: new Date().toISOString()
        };
        
        fs.writeFileSync(walletPath, JSON.stringify(walletData, null, 2));
        console.log(`[Wallet Manager] Created new wallet for user: ${userId} at ${wallet.address}`);
        
        return {
          wallet,
          isNewWallet: true,
          privateKey: wallet.privateKey // Return private key for new wallets
        };
      }
    } catch (error) {
      console.error('[Wallet Manager] Error managing wallet:', error);
      throw new Error(`Failed to manage tipping wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateLastUsed(userId: string): Promise<void> {
    try {
      // Update file timestamp
      const walletPath = this.getWalletPath(userId);
      if (fs.existsSync(walletPath)) {
        const data = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
        data.lastUsed = new Date().toISOString();
        fs.writeFileSync(walletPath, JSON.stringify(data, null, 2));
      }
    } catch (error) {
      console.error('[Wallet Manager] Error updating last used:', error);
    }
  }

  static async getWalletData(userId: string): Promise<any> {
    try {
      const walletPath = this.getWalletPath(userId);
      if (fs.existsSync(walletPath)) {
        return JSON.parse(fs.readFileSync(walletPath, 'utf8'));
      }
      throw new Error(`Wallet not found for user: ${userId}`);
    } catch (error) {
      console.error('[Wallet Manager] Error getting wallet data:', error);
      throw error;
    }
  }

  static async getUSDCBalance(address: string): Promise<number> {
    try {
      // Connect to Base network for USDC balance
      const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
      
      // USDC contract on Base
      const usdcAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
      const usdcAbi = [
        'function balanceOf(address owner) view returns (uint256)',
        'function decimals() view returns (uint8)'
      ];
      
      const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider);
      const balance = await usdcContract.balanceOf(address);
      const decimals = await usdcContract.decimals();
      
      // Convert from wei to USDC (6 decimals)
      return parseFloat(ethers.formatUnits(balance, decimals));
    } catch (error) {
      console.error('[Wallet Manager] Error fetching USDC balance:', error);
      return 0;
    }
  }
}

export default class CheckTippingBalanceTool extends MCPTool<CheckTippingBalanceParams> {
  readonly name = 'check_tipping_balance';
  readonly description = 'Check your dedicated tipping wallet balance and get wallet info. Returns structured JSON with wallet details. Creates new wallet if none exists. Provide your tip.md user ID if you have one, or leave empty for new users.';
  
  // Schema for optional tip.md user ID parameter
  schema = CheckTippingBalanceSchema;

  async execute(params: CheckTippingBalanceParams, context?: { sessionId?: string }): Promise<BalanceCheckResult> {
    try {
      const sessionId = context?.sessionId;
      console.log(`[Check Balance] Session: ${sessionId || 'default'}`);

      // Check if we're in standalone mode (demo)
      if (isStandaloneMode()) {
        console.log('[Check Balance] Running in standalone/demo mode');
        
        const userId = params.tipMdUserId || `demo_user_${Date.now()}`;
        return createDemoBalanceResponse(userId);
      }

      // Use provided tip.md user ID or generate new one for first-time users
      let userId: string;
      if (params.tipMdUserId) {
        // Returning user with existing ID
        userId = params.tipMdUserId;
        console.log(`[Check Balance] Using provided tip.md user ID: ${userId}`);
      } else {
        // First-time user - generate new secure ID
        userId = await TippingWalletManager.getPersistentUserId(sessionId);
        console.log(`[Check Balance] Generated new tip.md user ID: ${userId}`);
      }

      // Get or create wallet using the user ID
      const { wallet, isNewWallet, privateKey } = await TippingWalletManager.getOrCreateWallet(sessionId, userId);
      
      if (isNewWallet) {
        // New wallet - return setup instructions with private key
        const result: BalanceCheckResult = {
          success: true,
          operation: "wallet_creation",
          data: {
            userId: userId,
            address: wallet.address,
            balance: 0,
            network: "base",
            isNewWallet: true,
            privateKey: privateKey,
            timestamp: new Date().toISOString()
          },
          setup: {
            instructions: [
              `Save your tip.md User ID: ${userId}`,
              `Save your private key securely: ${privateKey}`,
              `Import to MetaMask: Settings → Import Account → Private Key`,
              `Fund your wallet by sending USDC to: ${wallet.address} (Base network)`,
              `Use your tip.md ID in future sessions: ${userId}`
            ],
            warnings: [
              "This is your permanent identifier for tip.md",
              "You'll need this ID to access your wallet in future sessions",
              "It's cryptographically unique - no one else can have the same ID",
              "Copy and save the private key securely (password manager, etc.)",
              "The private key gives you full control of your wallet"
            ]
          },
          message: "New tip.md tipping wallet created successfully"
        };
        
        return result;
      } else {
        // Existing wallet - show balance and status
        const balance = await TippingWalletManager.getUSDCBalance(wallet.address);
        await TippingWalletManager.updateLastUsed(userId);
        
        const result: BalanceCheckResult = {
          success: true,
          operation: "balance_check",
          data: {
            userId: userId,
            address: wallet.address,
            balance: Number(balance.toFixed(2)),
            network: "base",
            isNewWallet: false,
            timestamp: new Date().toISOString()
          },
          message: balance > 0 
            ? `Wallet ready for tipping with ${balance.toFixed(2)} USDC balance`
            : "Wallet needs funding - send USDC to address to enable tipping"
        };
        
        return result;
      }
    } catch (error) {
      console.error('[Check Balance Tool] Error:', error);
      
      const result: BalanceCheckResult = {
        success: false,
        operation: "balance_check",
        error: {
          code: "SYSTEM_ERROR",
          message: "Failed to check tipping balance",
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        message: "Balance check failed due to system error"
      };
      
      return result;
    }
  }
}

// Export the wallet manager for use in other tools
export { TippingWalletManager }; 