import { MCPTool } from "mcp-framework";
import { z } from 'zod';
import { TippingWalletManager } from './CheckTippingBalanceTool.js';

const ExportTippingWalletSchema = z.object({
  tipMdUserId: z.string().describe("Your tip.md user ID (required to export wallet)")
});

type ExportTippingWalletParams = z.infer<typeof ExportTippingWalletSchema>;

interface ExportWalletResult {
  success: boolean;
  operation: string;
  data?: {
    userId: string;
    address: string;
    privateKey: string;
    network: string;
    isNewWallet: boolean;
    timestamp: string;
  };
  security?: {
    warnings: string[];
    importInstructions: {
      metamask: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: string;
  };
  message: string;
}

export default class ExportTippingWalletTool extends MCPTool<ExportTippingWalletParams> {
  name = "export_tipping_wallet";
  description = "Export your tipping wallet private key for full control (SECURITY SENSITIVE). Returns structured JSON with wallet data and security warnings. Requires your tip.md user ID. Base network only.";
  
  // Schema requires tip.md user ID
  schema = ExportTippingWalletSchema;

  constructor() {
    super();
  }

  async execute(input: ExportTippingWalletParams, context?: { sessionId?: string }): Promise<ExportWalletResult> {
    try {
      const sessionId = context?.sessionId;
      console.log(`[Export Wallet] Exporting wallet for session: ${sessionId || 'default'}`);

      // Use the provided tip.md user ID
      const userId = input.tipMdUserId;
      console.log(`[Export Wallet] Using tip.md user ID: ${userId}`);

      // Get wallet using shared wallet manager
      const { wallet, isNewWallet, privateKey } = await TippingWalletManager.getOrCreateWallet(sessionId, userId);
      
      let finalPrivateKey = privateKey;
      
      if (!isNewWallet) {
        // Existing wallet - get private key from wallet data
        const walletData = await TippingWalletManager.getWalletData(userId);
        finalPrivateKey = walletData.privateKey;
      }
      
      // Ensure we have a private key
      if (!finalPrivateKey) {
        const result: ExportWalletResult = {
          success: false,
          operation: "wallet_export",
          error: {
            code: "MISSING_PRIVATE_KEY",
            message: "Private key not available",
            details: "Could not retrieve private key from wallet data"
          },
          message: "Wallet export failed due to missing private key"
        };
        return result;
      }
      
      const result: ExportWalletResult = {
        success: true,
        operation: "wallet_export",
        data: {
          userId: userId,
          address: wallet.address,
          privateKey: finalPrivateKey,
          network: "base",
          isNewWallet: isNewWallet,
          timestamp: new Date().toISOString()
        },
        security: {
          warnings: [
            "This private key controls your funds",
            "Never share it with anyone",
            "Store it securely (password manager recommended)",
            "tip.md cannot recover lost keys"
          ],
          importInstructions: {
            metamask: "MetaMask → Settings → Import Account → Private Key"
          }
        },
        message: isNewWallet 
          ? "New tipping wallet created and exported successfully"
          : "Existing wallet exported successfully"
      };
      
      return result;

    } catch (error: any) {
      console.error('[Export Wallet Tool] Error:', error);
      
      const result: ExportWalletResult = {
        success: false,
        operation: "wallet_export",
        error: {
          code: "SYSTEM_ERROR",
          message: "Failed to export wallet",
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        message: "Wallet export failed due to system error"
      };
      
      return result;
    }
  }
} 