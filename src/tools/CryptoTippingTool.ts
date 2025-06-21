import { MCPTool } from "mcp-framework";
import { z } from "zod";
// @ts-ignore
import { User, userRepository } from '../../database/userRepository.js';

// Local logger for this tool
const toolLogger = {
  info: (...args: any[]) => console.log('[CryptoTippingTool]', ...args),
  error: (...args: any[]) => console.error('[CryptoTippingTool ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[CryptoTippingTool WARN]', ...args),
  debug: (...args: any[]) => console.debug('[CryptoTippingTool DEBUG]', ...args)
};

// Network configuration - simplified version of what's in client/src/lib/constants/networks.ts
// We need to define these here since we can't directly import from the client code
const NETWORKS: {
  ethereum: {
    testnet: {
      name: string;
      chainId: string;
      platformWallet: string;
    };
    mainnet: {
      name: string;
      chainId: string;
      platformWallet: string;
    };
  };
  solana: {
    testnet: {
      name: string;
      clusterUrl: string;
      platformWallet: string;
    };
    mainnet: {
      name: string;
      clusterUrl: string;
      platformWallet: string;
    };
  };
  base: { // Add Base here
    testnet: { name: string; chainId: string; platformWallet: string; };
    mainnet: { name: string; chainId: string; platformWallet: string; };
  };
} = {
  ethereum: {
    testnet: {
      name: 'Sepolia Testnet',
      chainId: '0xaa36a7',
      platformWallet: process.env.TESTNET_ETH_PLATFORM_WALLET || '0x1a7Dd27bFed5DF75dc1e0F0dE763A1E5701970f1',
    },
    mainnet: {
      name: 'Ethereum Mainnet',
      chainId: '0x1',
      platformWallet: process.env.MAINNET_ETH_PLATFORM_WALLET || '0xabcdef1234567890abcdef1234567890abcdef12',
    }
  },
  solana: {
    testnet: {
      name: 'Solana Devnet',
      clusterUrl: 'https://api.devnet.solana.com',
      platformWallet: process.env.TESTNET_SOL_PLATFORM_WALLET || '5o8vccNJ6wpZdYg3GY3qmYk3fSmiKxHq38o33uSmKHds',
    },
    mainnet: {
      name: 'Solana Mainnet',
      clusterUrl: process.env.SOLANA_RPC_URL || 'https://solana-mainnet.rpc.extrnode.com',
      platformWallet: process.env.MAINNET_SOL_PLATFORM_WALLET || 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    }
  },
  base: { // New entry for Base
    testnet: {
      name: 'Base Sepolia',
      chainId: '0x14A34', // 84532
      platformWallet: process.env.TESTNET_ETH_PLATFORM_WALLET || '0x1a7Dd27bFed5DF75dc1e0F0dE763A1E5701970f1', // Using ETH testnet platform wallet
    },
    mainnet: {
      name: 'Base Mainnet',
      chainId: '0x2105', // 8453
      platformWallet: process.env.MAINNET_ETH_PLATFORM_WALLET || '0xabcdef1234567890abcdef1234567890abcdef12', // Using ETH mainnet platform wallet
    }
  }
};

/**
 * Get the network mode (testnet or mainnet) based on environment
 */
function getNetworkMode(): 'testnet' | 'mainnet' {
  // Default to testnet unless explicitly set to mainnet in environment
  return (process.env.NETWORK_MODE === 'mainnet') ? 'mainnet' : 'testnet';
}

/**
 * Get the configuration for a specific blockchain and network mode
 */
function getNetworkConfig(blockchain: 'ethereum' | 'solana' | 'base') {
  const mode = getNetworkMode();
  return NETWORKS[blockchain][mode];
}

/**
 * Get the platform wallet address for a specific blockchain
 */
function getPlatformWallet(blockchain: 'ethereum' | 'solana' | 'base'): string {
  const config = getNetworkConfig(blockchain);
  return config?.platformWallet || '';
}

// Define the Zod schema for parameters validation
const BlockchainTippingParamsZodSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 
    'Username must contain only alphanumeric characters, underscores, and hyphens'),
  blockchain: z.enum(['ethereum', 'solana', 'base']),
  amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Amount must be a positive number'
  }),
  token: z.enum(['ETH', 'SOL', 'USDC'])
});

// Type for the input parameters
export type BlockchainTippingParams = z.infer<typeof BlockchainTippingParamsZodSchema>;

// Response types for different blockchains
type EthereumTippingResponse = {
  prompt: string; // Explanation for LLM
  content: {
    blockchain: 'ethereum' | 'base';
    recipientAddress: string; // Split address
    token: 'ETH' | 'USDC'; // Modified
    amount: number;
    platformFeePercentage: number;
    network: string;
  };
};

type SolanaTippingResponse = {
  prompt: string;
  content: {
    blockchain: 'solana';
    token: 'SOL' | 'USDC';
    network: string; // Common field
    platformFeePercentage: number; // Common field
    amount?: number; // For SOL: Original tip amount in SOL, for USDC: use totalAmount

    // Fields for SOL native transactions
    developerAmount?: number;         // SOL only: amount for dev (SOL)
    platformFeeAmount?: number;       // SOL only: amount for platform (SOL)
    transaction?: {                   // SOL only: detailed transaction object
      clusterUrl: string;
      recipientAddress: string;       // Developer's main SOL address for SOL tx
      platformAddress: string;        // Platform's main SOL address for SOL tx
      lamports: {
        total: number;
        developer: number;
        platformFee: number;
      };
      instructions: [
        {
          program: string;
          programId: string;
          data: {
            instruction: number;
            lamports: number;
          };
          keys: [
            { pubkey: string; isSigner: boolean; isWritable: boolean; },
            { pubkey: string; isSigner: boolean; isWritable: boolean; }
          ]
        },
        {
          program: string;
          programId: string;
          data: {
            instruction: number;
            lamports: number;
          };
          keys: [
            { pubkey: string; isSigner: boolean; isWritable: boolean; },
            { pubkey: string; isSigner: boolean; isWritable: boolean; }
          ]
        }
      ];
      transactionConstructionSnippet: string;
    };

    // Fields for USDC SPL token transfers
    totalAmount?: number;             // USDC: total tip amount in USDC
    transfers?: Array<{              // USDC: array of transfers to perform
      recipientType: 'developer' | 'platform';
      targetAddress: string;          // Main SOL address (client derives ATA)
      amount: number;                 // Amount in USDC
      info: string;
    }>;
  };
};

type TippingErrorResponse = {
  prompt: string;
  content: {
    error: string;
  };
};

type BlockchainTippingResponse = EthereumTippingResponse | SolanaTippingResponse | TippingErrorResponse;

export default class CryptoTippingTool extends MCPTool<BlockchainTippingParams> {
  name = "crypto_tipping";
  description = "Provides details for crypto tipping a tip.md user via blockchain. Supporting Ethereum, Baseand Solana.";
  
  schema = {
    username: {
      type: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 
        'Username must contain only alphanumeric characters, underscores, and hyphens'),
      description: 'Username of the recipient for the tip.'
    },
    blockchain: {
      type: z.enum(['ethereum', 'solana', 'base']),
      description: 'The blockchain to use for the transaction (ethereum, solana, or base).'
    },
    amount: {
      type: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: 'Amount must be a positive number'
      }),
      description: 'The amount to tip in the native token.'
    },
    token: {
      type: z.enum(['ETH', 'SOL', 'USDC']),
      description: 'The token to use for the tip (ETH or USDC for ethereum/base, SOL or USDC for solana).'
    }
  };

  constructor() { super(); }

  async execute(input: BlockchainTippingParams): Promise<BlockchainTippingResponse> {
    const { username, blockchain, amount, token } = input;
    
    toolLogger.info(`Executing ${this.name} for user: ${username}, blockchain: ${blockchain}, amount: ${amount} ${token}`);
    
    try {
      // Validate blockchain and token match
      if (
        (blockchain === 'ethereum' && token !== 'ETH' && token !== 'USDC') ||
        (blockchain === 'solana' && token !== 'SOL' && token !== 'USDC') ||
        (blockchain === 'base' && token !== 'ETH' && token !== 'USDC') // Added condition for Base
      ) {
        return {
          prompt: "Error in transaction setup:",
          content: {
            error: `Token mismatch: ${token} is not valid for ${blockchain} blockchain. Use ${
              blockchain === 'ethereum' ? 'ETH or USDC' : 
              blockchain === 'solana' ? 'SOL or USDC' : 
              'ETH or USDC' // For Base
            }.`
          }
        };
      }

      // Get the user from the database
      const user = await userRepository.getUserByUsername(username);
      if (!user) {
        toolLogger.warn(`User not found: ${username}`);
        return {
          prompt: "Error finding user:",
          content: {
            error: `User with username '${username}' not found`
          }
        };
      }

      // Process based on blockchain
      if (blockchain === 'ethereum' || blockchain === 'base') { // Group Ethereum and Base
        return this.handleEthereumTipping(user, amount, token as 'ETH' | 'USDC', blockchain);
      } else if (blockchain === 'solana') {
        return this.handleSolanaTipping(user, amount, token as 'SOL' | 'USDC');
      } else {
        // This shouldn't happen due to zod validation, but keeping for type safety
        return {
          prompt: "Error with blockchain selection:",
          content: {
            error: `Unsupported blockchain: ${blockchain}`
          }
        };
      }
    } catch (error: any) {
      toolLogger.error(`Error in ${this.name} for user ${username}:`, error.message);
      return {
        prompt: "Error processing transaction:",
        content: {
          error: `Failed to process tipping for ${username}: ${error.message || String(error)}`
        }
      };
    }
  }

  private handleEthereumTipping(
    user: User, 
    amount: string, 
    token: 'ETH' | 'USDC', 
    blockchain: 'ethereum' | 'base'
  ): EthereumTippingResponse | TippingErrorResponse {
    // For Ethereum or Base, we need the split address only
    // Assumption: user.ethereumSplitAddress is used for Base as well.
    if (!user.ethereumSplitAddress) {
      const networkDisplayName = blockchain === 'base' ? 'Base' : 'Ethereum';
      return {
        prompt: `Error with ${networkDisplayName} configuration:`,
        content: {
          error: `User does not have an ${networkDisplayName} split address configured`
        }
      };
    }

    // Get network information
    const networkConfig = getNetworkConfig(blockchain);
    const networkDisplayName = blockchain === 'base' ? 'Base' : 'Ethereum';
    
    let promptMessage = '';
    if (token === 'USDC') {
      promptMessage = `This is a ${networkDisplayName} tip transaction using a Splits.org contract for USDC. The provided address (${user.ethereumSplitAddress}) is an audited smart contract that the developer has deployed. This Splits.org contract will automatically handle the 96%/4% split for USDC between the developer and the tip.md platform. Simply send the full USDC amount to this single address and the contract will handle the distribution. Your wallet will need to approve the USDC token spending if it's the first time sending to this contract. Ensure your wallet is on the ${networkConfig.name} network.`;
    } else { // ETH
      promptMessage = `This is a ${networkDisplayName} tip transaction using a Splits.org contract for ETH. The provided address (${user.ethereumSplitAddress}) is an audited smart contract that the developer has deployed. This Splits.org contract will automatically handle the 96%/4% split for ETH between the developer and the tip.md platform. Simply send the full ETH amount to this single address and the contract will handle the distribution. No additional transaction construction is needed. Ensure your wallet is on the ${networkConfig.name} network.`;
    }
    
    return {
      prompt: promptMessage,
      content: {
        blockchain: blockchain, // 'ethereum' or 'base'
        recipientAddress: user.ethereumSplitAddress,
        token: token,
        amount: parseFloat(amount),
        platformFeePercentage: 0.04, // 4%
        network: networkConfig.name // e.g., 'Base Mainnet' or 'Sepolia Testnet'
      }
    };
  }

  private handleSolanaTipping(user: User, amount: string, token: 'SOL' | 'USDC'): SolanaTippingResponse | TippingErrorResponse {
    // Check if user has Solana address
    if (!user.solanaAddress) {
      return {
        prompt: "Error with Solana configuration:",
        content: {
          error: 'User does not have a Solana wallet address configured'
        }
      };
    }
    
    const networkConfig = getNetworkConfig('solana');
    const amountFloat = parseFloat(amount);
    const platformFeePercentage = 0.04; // 4%

    if (token === 'USDC') {
      const platformWalletAddress = getPlatformWallet('solana');
      if (!platformWalletAddress) {
        return {
          prompt: "Error with platform configuration:",
          content: { // This content structure doesn't match SolanaTippingResponse for an error, but it's how TippingErrorResponse is structured
            error: 'Platform wallet address not configured for Solana'
          }
        };
      }

      const platformFeeAmountUsdc = amountFloat * platformFeePercentage;
      const developerAmountUsdc = amountFloat - platformFeeAmountUsdc;

      return {
        prompt: `This is a Solana tip transaction for USDC. To complete the tip, two SPL token transfers are required:
1. A transfer of ${developerAmountUsdc.toFixed(6)} USDC to the developer.
2. A transfer of ${platformFeeAmountUsdc.toFixed(6)} USDC to the tip.md platform.
Your wallet will be guided to perform these two transfers. Please ensure you have enough USDC and SOL (for transaction fees). The client application will use the developer's main Solana address (${user.solanaAddress}) and the platform's main Solana address (${platformWalletAddress}) to determine the correct USDC token accounts for these transfers.`,
        content: {
          blockchain: 'solana',
          token: 'USDC',
          network: networkConfig.name,
          platformFeePercentage: platformFeePercentage,
          totalAmount: amountFloat,
          transfers: [
            {
              recipientType: 'developer',
              targetAddress: user.solanaAddress!, // user.solanaAddress is checked at the beginning
              amount: developerAmountUsdc,
              info: "Developer's share of the tip."
            },
            {
              recipientType: 'platform',
              targetAddress: platformWalletAddress,
              amount: platformFeeAmountUsdc,
              info: "Platform fee."
            }
          ]
        }
      };
    }

    // SOL specific handling (original logic)
    const platformWalletAddressSol = getPlatformWallet('solana'); // Renamed to avoid conflict if used above
    if (!platformWalletAddressSol) {
      return {
        prompt: "Error with platform configuration:",
        content: {
          error: 'Platform wallet address not configured for Solana'
        }
      };
    }
    
    const solanaNetworkConfig = networkConfig as {
      name: string;
      clusterUrl: string;
      platformWallet: string;
    };
    
    const platformFeeAmountSol = amountFloat * platformFeePercentage;
    const developerAmountSol = amountFloat - platformFeeAmountSol;
    
    const totalLamports = Math.floor(amountFloat * 1000000000);
    const feeLamports = Math.floor(platformFeeAmountSol * 1000000000);
    const developerLamports = Math.floor(developerAmountSol * 1000000000);

    const SYSTEM_PROGRAM_ID = "11111111111111111111111111111111";
    
    return {
      prompt: `This is a Solana tip transaction which includes two separate transfers: one for the platform fee (4%) and one for the developer (96%). 
      
You just need to replace the placeholder "<AGENT_PUBKEY>" in both transaction instructions with your actual sender's public key. 

The transaction is already pre-constructed for you, you just need to sign and send it using your wallet.

If needed, you can use the provided transactionConstructionSnippet as a code snippet to help you understand the transaction.`,
      content: {
        blockchain: 'solana',
        token: 'SOL',
        network: solanaNetworkConfig.name,
        platformFeePercentage: platformFeePercentage,
        amount: amountFloat, // Original total SOL amount
        developerAmount: developerAmountSol,
        platformFeeAmount: platformFeeAmountSol,
        transaction: {
          clusterUrl: solanaNetworkConfig.clusterUrl,
          recipientAddress: user.solanaAddress!, // user.solanaAddress is checked
          platformAddress: platformWalletAddressSol,
          lamports: {
            total: totalLamports,
            developer: developerLamports,
            platformFee: feeLamports
          },
          instructions: [
            {
              program: "System",
              programId: SYSTEM_PROGRAM_ID,
              data: { instruction: 2, lamports: feeLamports },
              keys: [
                { pubkey: "<AGENT_PUBKEY>", isSigner: true, isWritable: true },
                { pubkey: platformWalletAddressSol, isSigner: false, isWritable: true }
              ]
            },
            {
              program: "System",
              programId: SYSTEM_PROGRAM_ID,
              data: { instruction: 2, lamports: developerLamports },
              keys: [
                { pubkey: "<AGENT_PUBKEY>", isSigner: true, isWritable: true },
                { pubkey: user.solanaAddress!, isSigner: false, isWritable: true }
              ]
            }
          ],
          transactionConstructionSnippet: `
            // 1. Create transaction
            const transaction = new Transaction();
            
            // 2. Get recent blockhash (do this right before sending)
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            
            // 3. Set fee payer
            transaction.feePayer = yourPublicKey;
            
            // 4. Sign and send transaction
            // (wallet-specific code would go here)
          `
        }
      }
    };
  }
}