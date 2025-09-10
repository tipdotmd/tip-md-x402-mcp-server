import express from 'express';
import cors from 'cors';
import { paymentMiddleware } from 'x402-express';
import { facilitator } from '@coinbase/x402';
import { CdpClient } from '@coinbase/cdp-sdk';
import { createWalletClient, http, createPublicClient, parseUnits } from 'viem';
import { SolanaAddress } from 'x402-express';
import { toAccount } from 'viem/accounts';
import { base } from 'viem/chains';
import { logger } from '../logger.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

// Environment variables validation
const validateEnvironment = () => {
  const required = ['CDP_API_KEY_ID', 'CDP_API_KEY_SECRET', 'CDP_AGENT_ADDRESS', 'VITE_MAINNET_ETH_PLATFORM_WALLET'];
  
  console.log('Checking environment variables:');
  required.forEach(env => {
    console.log(`  ${env}: ${process.env[env] ? 'SET' : 'MISSING'}`);
  });
  
  const missing = required.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

// Initialize CDP client and platform account
let cdpClient: CdpClient | null = null;
let platformAccount: any = null;
let walletClient: any = null;
let publicClient: any = null;

// ETH balance monitoring function
const checkAndAlertLowETHBalance = async () => {
  try {
    if (!publicClient || !platformAccount) {
      logger.warn('Cannot check ETH balance - clients not initialized');
      return;
    }

    const ethBalance = await publicClient.getBalance({ 
      address: platformAccount.address as `0x${string}` 
    });
    
    const ethInETH = parseFloat(ethBalance.toString()) / 1e18; // Convert wei to ETH
    const approximateUSD = ethInETH * 3000; // Rough ETH price estimate
    
    logger.info(`Platform ETH balance: ${ethInETH.toFixed(6)} ETH (~$${approximateUSD.toFixed(2)})`);
    
    // Alert if below $1.50 worth (safety buffer)
    if (approximateUSD < 1.5) {
      await sendLowBalanceAlert(ethInETH, approximateUSD);
    }
  } catch (error) {
    logger.error('Failed to check ETH balance:', error);
  }
};

// Simple notification function using existing ntfy setup
const sendLowBalanceAlert = async (balanceETH: number, approximateUSD: number) => {
  try {
    const topicPrefix = process.env.NTFY_TOPIC_PREFIX || 'td';
    const baseUrl = process.env.NTFY_BASE_URL || 'https://ntfy.sh';
    const authToken = process.env.NTFY_AUTH_TOKEN;
    
    if (!baseUrl) {
      logger.warn('NTFY_BASE_URL not configured - cannot send low balance alert');
      return;
    }

    const message = `🚨 Platform ETH Low: ${balanceETH.toFixed(6)} ETH (~$${approximateUSD.toFixed(2)})`;
    const url = `${baseUrl}/${topicPrefix}-notifs`;
    
    const headers: any = {
      'Content-Type': 'text/plain',
      'Title': 'CDP Platform Wallet - Low ETH Balance',
      'Tags': 'warning,money,ethereum'
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      body: message,
      headers
    });
    
    if (response.ok) {
      logger.info(`Low balance alert sent successfully`);
    } else {
      logger.error(`Failed to send low balance alert: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    logger.error('Failed to send low balance notification:', error);
  }
};

const initializePlatformWallet = async () => {
  try {
    // Initialize CDP client
    cdpClient = new CdpClient();
    
    // Use the existing funded CDP account by address
    const cdpAgentAddress = process.env.CDP_AGENT_ADDRESS! as `0x${string}`;
    platformAccount = await cdpClient.evm.getAccount({ address: cdpAgentAddress });
    
    // Create viem wallet client for transactions (following CDP docs)
    walletClient = createWalletClient({
      account: toAccount(platformAccount),
      chain: base, // Using Base mainnet for lower fees
      transport: http(),
    });

    // Create public client for transaction confirmation
    publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });
    
    logger.info('Platform account initialized successfully');
    logger.info(`Platform account address: ${platformAccount.address}`);
    
  } catch (error) {
    logger.error('Failed to initialize platform account:', error);
    throw error;
  }
};

// x402 Payment endpoint for tipping service with dynamic pricing
const setupTipRoute = (app: any) => {
  app.post('/tip-solana', async (req: any, res: any): Promise<void> => {
    try {
      const { recipientUsername, recipientAddress, tipAmount, message, senderName } = req.body;
      
      if (!recipientUsername || !recipientAddress || !tipAmount) {
        res.status(400).json({ 
          error: 'recipientUsername, recipientAddress, and tipAmount are required' 
        });
        return;
      }

      logger.info(`Processing tip: ${tipAmount} USDC to ${recipientUsername} from ${senderName || 'Anonymous'}`);

      // 🔍 HACKATHON TRANSPARENCY: Log incoming x402 headers
      logger.info('=== x402 PAYMENT PROTOCOL ANALYSIS ===');
      logger.info('📥 INCOMING REQUEST HEADERS:');
      Object.keys(req.headers).forEach(header => {
        if (header.toLowerCase().includes('authorization') || 
            header.toLowerCase().includes('payment') || 
            header.toLowerCase().includes('x402') ||
            header.toLowerCase().includes('signature')) {
          logger.info(`  ${header}: ${req.headers[header]}`);
        }
      });

      // Apply x402 payment verification dynamically based on tip amount
      // x402 payments should go to CDP_AGENT_ADDRESS (the funded wallet we use for distribution)
      // const cdpAgentWallet = (process.env.CDP_AGENT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
      
      // Create dynamic payment middleware for this specific tip amount
      const dynamicPaymentMiddleware = paymentMiddleware(
        "2xvcjUJ33UZxJ5R3cK8xYXJwc7GmunUJ4pRkWm24FSJ7" as SolanaAddress,
        {
          "POST /tip-solana": {
            price: `$${(tipAmount / 1000000).toFixed(2)}`, // Convert from microUSDC to USDC
            network: "solana"
          }
        },
        {url: "https://facilitator.payai.network"}
      );

      // 🔍 HACKATHON TRANSPARENCY: Log x402 payment requirements
      logger.info('💰 x402 PAYMENT REQUIREMENTS:');
      logger.info(`  Required Payment: $${(tipAmount / 1000000).toFixed(2)} USDC`);
      logger.info(`  Payment Recipient: ${"2xvcjUJ33UZxJ5R3cK8xYXJwc7GmunUJ4pRkWm24FSJ7"}`);
      logger.info(`  Network: Solana`);
      logger.info(`  Protocol: x402 (HTTP 402 Payment Required)`);

      // Apply the middleware dynamically to this request
      let paymentVerified = false;
      await new Promise<void>((resolve, reject) => {
        // Capture the original res.status and res.json to intercept 402 responses
        const originalStatus = res.status.bind(res);
        const originalJson = res.json.bind(res);
        
        res.status = function(code: number) {
          if (code === 402) {
            logger.info('🚫 x402 PAYMENT CHALLENGE ISSUED:');
            logger.info(`  Status Code: 402 Payment Required`);
            logger.info(`  Challenge Type: Blockchain payment verification`);
          }
          return originalStatus(code);
        };

        res.json = function(data: any) {
          if (res.statusCode === 402) {
            logger.info('📋 x402 PAYMENT CHALLENGE DETAILS:');
            logger.info(`  Challenge Data: ${JSON.stringify(data, null, 2)}`);
          } else if (res.statusCode === 200) {
            paymentVerified = true;
            logger.info('✅ x402 PAYMENT VERIFICATION SUCCESS:');
            logger.info(`  Payment verified and accepted`);
            logger.info(`  Proceeding with service delivery`);
          }
          return originalJson(data);
        };

        dynamicPaymentMiddleware(req, res, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // 🔍 HACKATHON TRANSPARENCY: Log payment verification result
      if (!paymentVerified && res.statusCode !== 200) {
        logger.info('❌ x402 PAYMENT VERIFICATION FAILED');
        logger.info('  Service delivery blocked - payment required');
        return; // Exit early if payment not verified
      }

      logger.info('🎉 x402 PAYMENT PROTOCOL COMPLETED SUCCESSFULLY');
      logger.info('  Payment verified - delivering premium service');

      // Payment has been verified and processed - now distribute the funds
      // Use the recipientAddress directly (no need for database lookup since MCP tool already validated)

      // Calculate split amounts (96% to recipient, 4% to platform)
      const recipientAmount = Math.floor(tipAmount * 0.96);
      const platformAmount = tipAmount - recipientAmount;

      // if (!cdpClient || !platformAccount || !walletClient || !publicClient) {
      //   throw new Error('Platform account not initialized');
      // }

      // // Transfer USDC using CDP SDK (96% to recipient, 4% to platform)
      // logger.info(`Transferring ${recipientAmount / 1000000} USDC to recipient: ${recipientAddress}`);
      // logger.info(`Transferring ${platformAmount / 1000000} USDC to platform: ${process.env.VITE_MAINNET_ETH_PLATFORM_WALLET}`);
      
      // // Execute both transfers using CDP SDK
      // const recipientTransfer = await platformAccount.transfer({
      //   to: recipientAddress as `0x${string}`,
      //   amount: BigInt(recipientAmount), // Already in microUSDC units
      //   token: "usdc",
      //   network: "base"
      // });

      // const platformTransfer = await platformAccount.transfer({
      //   to: process.env.VITE_MAINNET_ETH_PLATFORM_WALLET as `0x${string}`,
      //   amount: BigInt(platformAmount), // Already in microUSDC units  
      //   token: "usdc",
      //   network: "base"
      // });

      // const hash = recipientTransfer.transactionHash; // Use recipient transfer hash as primary
      
      // logger.info(`Transfers completed:`);
      // logger.info(`  Recipient: ${recipientTransfer.transactionHash}`);
      // logger.info(`  Platform: ${platformTransfer.transactionHash}`);
      // logger.info(`Platform earned ${platformAmount / 1000000} USDC fee from this transaction`);

      // // 🔍 HACKATHON TRANSPARENCY: Log complete transaction summary
      // logger.info('=== x402 TRANSACTION SUMMARY ===');
      // logger.info(`✅ Protocol: HTTP 402 Payment Required (x402)`);
      // logger.info(`✅ Payment: $${(tipAmount / 1000000).toFixed(2)} USDC verified`);
      // logger.info(`✅ Service: Tip distribution completed`);
      // logger.info(`✅ Blockchain: Base network transactions confirmed`);
      // logger.info(`📊 Value Distribution:`);
      // logger.info(`  • Recipient (${recipientUsername}): ${recipientAmount / 1000000} USDC`);
      // logger.info(`  • Platform Fee: ${platformAmount / 1000000} USDC`);
      // logger.info(`🔗 Transaction Hashes:`);
      // logger.info(`  • Recipient: ${recipientTransfer.transactionHash}`);
      // logger.info(`  • Platform: ${platformTransfer.transactionHash}`);
      // logger.info('=== END x402 TRANSACTION ===');

      // Check ETH balance after successful distribution and alert if low
      // await checkAndAlertLowETHBalance();

      // Note: Database persistence is handled by the calling MCP tool (TipOnBaseTool)
      // This server only handles payment verification and blockchain transfers
      logger.info(`Payment processing completed: ${tipAmount / 1000000} USDC to ${recipientUsername}`);

      const toReturn = { 
        success: true,
        message: `Successfully processed payment of ${tipAmount / 1000000} USDC to ${recipientUsername}`,
        recipient: {
          username: recipientUsername,
          address: recipientAddress,
          userId: null // No longer doing database lookup here - MCP tool handles this
        },
        transactions: {
          // recipient: recipientTransfer.transactionHash,
          // platform: platformTransfer.transactionHash
          recipient: "TODO recipient transaction hash",
          platform: "TODO platform transaction hash"
        },
        amounts: {
          total: tipAmount / 1000000,
          recipient: recipientAmount / 1000000,
          platformFee: platformAmount / 1000000
        },
        // 🔍 HACKATHON TRANSPARENCY: Add x402 protocol info to response
        x402Protocol: {
          paymentVerified: true,
          protocolVersion: "x402",
          paymentMethod: "blockchain",
          network: "solana",
          paymentAmount: `$${(tipAmount / 1000000).toFixed(2)} USDC`
        }
      };
      logger.info(`To return: ${JSON.stringify(toReturn, null, 2)}`);
      res.json(toReturn);
      return;

    } catch (error) {
      logger.error('Error processing tip:', error);
      logger.error('=== x402 TRANSACTION FAILED ===');
      res.status(500).json({ 
        error: 'Failed to process tip',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.post('/tip-base', async (req: any, res: any): Promise<void> => {
    try {
      const { recipientUsername, recipientAddress, tipAmount, message, senderName } = req.body;
      
      if (!recipientUsername || !recipientAddress || !tipAmount) {
        res.status(400).json({ 
          error: 'recipientUsername, recipientAddress, and tipAmount are required' 
        });
        return;
      }

      logger.info(`Processing tip: ${tipAmount} USDC to ${recipientUsername} from ${senderName || 'Anonymous'}`);

      // 🔍 HACKATHON TRANSPARENCY: Log incoming x402 headers
      logger.info('=== x402 PAYMENT PROTOCOL ANALYSIS ===');
      logger.info('📥 INCOMING REQUEST HEADERS:');
      Object.keys(req.headers).forEach(header => {
        if (header.toLowerCase().includes('authorization') || 
            header.toLowerCase().includes('payment') || 
            header.toLowerCase().includes('x402') ||
            header.toLowerCase().includes('signature')) {
          logger.info(`  ${header}: ${req.headers[header]}`);
        }
      });

      // Apply x402 payment verification dynamically based on tip amount
      // x402 payments should go to CDP_AGENT_ADDRESS (the funded wallet we use for distribution)
      const cdpAgentWallet = (process.env.CDP_AGENT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;
      
      // Create dynamic payment middleware for this specific tip amount
      const dynamicPaymentMiddleware = paymentMiddleware(
        cdpAgentWallet,
        {
          "POST /tip-base": {
            price: `$${(tipAmount / 1000000).toFixed(2)}`, // Convert from microUSDC to USDC
            network: "base"
          }
        },
        {url: "https://facilitator.payai.network"}
      );

      // 🔍 HACKATHON TRANSPARENCY: Log x402 payment requirements
      logger.info('💰 x402 PAYMENT REQUIREMENTS:');
      logger.info(`  Required Payment: $${(tipAmount / 1000000).toFixed(2)} USDC`);
      logger.info(`  Payment Recipient: ${cdpAgentWallet}`);
      logger.info(`  Network: Base`);
      logger.info(`  Protocol: x402 (HTTP 402 Payment Required)`);

      // Apply the middleware dynamically to this request
      let paymentVerified = false;
      await new Promise<void>((resolve, reject) => {
        // Capture the original res.status and res.json to intercept 402 responses
        const originalStatus = res.status.bind(res);
        const originalJson = res.json.bind(res);
        
        res.status = function(code: number) {
          if (code === 402) {
            logger.info('🚫 x402 PAYMENT CHALLENGE ISSUED:');
            logger.info(`  Status Code: 402 Payment Required`);
            logger.info(`  Challenge Type: Blockchain payment verification`);
          }
          return originalStatus(code);
        };

        res.json = function(data: any) {
          if (res.statusCode === 402) {
            logger.info('📋 x402 PAYMENT CHALLENGE DETAILS:');
            logger.info(`  Challenge Data: ${JSON.stringify(data, null, 2)}`);
          } else if (res.statusCode === 200) {
            paymentVerified = true;
            logger.info('✅ x402 PAYMENT VERIFICATION SUCCESS:');
            logger.info(`  Payment verified and accepted`);
            logger.info(`  Proceeding with service delivery`);
          }
          return originalJson(data);
        };

        dynamicPaymentMiddleware(req, res, (err: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // 🔍 HACKATHON TRANSPARENCY: Log payment verification result
      if (!paymentVerified && res.statusCode !== 200) {
        logger.info('❌ x402 PAYMENT VERIFICATION FAILED');
        logger.info('  Service delivery blocked - payment required');
        return; // Exit early if payment not verified
      }

      logger.info('🎉 x402 PAYMENT PROTOCOL COMPLETED SUCCESSFULLY');
      logger.info('  Payment verified - delivering premium service');

      // Payment has been verified and processed - now distribute the funds
      // Use the recipientAddress directly (no need for database lookup since MCP tool already validated)

      // Calculate split amounts (96% to recipient, 4% to platform)
      const recipientAmount = Math.floor(tipAmount * 0.96);
      const platformAmount = tipAmount - recipientAmount;

      if (!cdpClient || !platformAccount || !walletClient || !publicClient) {
        throw new Error('Platform account not initialized');
      }

      // Transfer USDC using CDP SDK (96% to recipient, 4% to platform)
      logger.info(`Transferring ${recipientAmount / 1000000} USDC to recipient: ${recipientAddress}`);
      logger.info(`Transferring ${platformAmount / 1000000} USDC to platform: ${process.env.VITE_MAINNET_ETH_PLATFORM_WALLET}`);
      
      // Execute both transfers using CDP SDK
      const recipientTransfer = await platformAccount.transfer({
        to: recipientAddress as `0x${string}`,
        amount: BigInt(recipientAmount), // Already in microUSDC units
        token: "usdc",
        network: "base"
      });

      const platformTransfer = await platformAccount.transfer({
        to: process.env.VITE_MAINNET_ETH_PLATFORM_WALLET as `0x${string}`,
        amount: BigInt(platformAmount), // Already in microUSDC units  
        token: "usdc",
        network: "base"
      });

      const hash = recipientTransfer.transactionHash; // Use recipient transfer hash as primary
      
      logger.info(`Transfers completed:`);
      logger.info(`  Recipient: ${recipientTransfer.transactionHash}`);
      logger.info(`  Platform: ${platformTransfer.transactionHash}`);
      logger.info(`Platform earned ${platformAmount / 1000000} USDC fee from this transaction`);

      // 🔍 HACKATHON TRANSPARENCY: Log complete transaction summary
      logger.info('=== x402 TRANSACTION SUMMARY ===');
      logger.info(`✅ Protocol: HTTP 402 Payment Required (x402)`);
      logger.info(`✅ Payment: $${(tipAmount / 1000000).toFixed(2)} USDC verified`);
      logger.info(`✅ Service: Tip distribution completed`);
      logger.info(`✅ Blockchain: Base network transactions confirmed`);
      logger.info(`📊 Value Distribution:`);
      logger.info(`  • Recipient (${recipientUsername}): ${recipientAmount / 1000000} USDC`);
      logger.info(`  • Platform Fee: ${platformAmount / 1000000} USDC`);
      logger.info(`🔗 Transaction Hashes:`);
      logger.info(`  • Recipient: ${recipientTransfer.transactionHash}`);
      logger.info(`  • Platform: ${platformTransfer.transactionHash}`);
      logger.info('=== END x402 TRANSACTION ===');

      // Check ETH balance after successful distribution and alert if low
      await checkAndAlertLowETHBalance();

      // Note: Database persistence is handled by the calling MCP tool (TipOnBaseTool)
      // This server only handles payment verification and blockchain transfers
      logger.info(`Payment processing completed: ${tipAmount / 1000000} USDC to ${recipientUsername}`);

      res.json({ 
        success: true,
        message: `Successfully processed payment of ${tipAmount / 1000000} USDC to ${recipientUsername}`,
        recipient: {
          username: recipientUsername,
          address: recipientAddress,
          userId: null // No longer doing database lookup here - MCP tool handles this
        },
        transactions: {
          recipient: recipientTransfer.transactionHash,
          platform: platformTransfer.transactionHash
        },
        amounts: {
          total: tipAmount / 1000000,
          recipient: recipientAmount / 1000000,
          platformFee: platformAmount / 1000000
        },
        // 🔍 HACKATHON TRANSPARENCY: Add x402 protocol info to response
        x402Protocol: {
          paymentVerified: true,
          protocolVersion: "x402",
          paymentMethod: "blockchain",
          network: "base",
          paymentAmount: `$${(tipAmount / 1000000).toFixed(2)} USDC`
        }
      });
      return;

    } catch (error) {
      logger.error('Error processing tip:', error);
      logger.error('=== x402 TRANSACTION FAILED ===');
      res.status(500).json({ 
        error: 'Failed to process tip',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });  
};

// Health check endpoint
const setupHealthRoute = (app: any) => {
  app.get('/health', (req: any, res: any) => {
    res.json({ 
      status: 'ok', 
      service: 'x402-tipping-server',
      timestamp: new Date().toISOString(),
      platformAccount: platformAccount ? 'initialized' : 'not_initialized'
    });
  });
};

// Get tipping rates endpoint
const setupRatesRoute = (app: any) => {
  app.get('/rates', (req: any, res: any) => {
    res.json({
      baseRate: 1000000, // 1 USDC in microunits
      currency: 'USDC',
      network: 'base-mainnet',
      recipientSplit: 96, // 96%
      platformFee: 4 // 4%
    });
  });
};

export const setupX402Routes = async (app: any) => {
  try {
    // Validate environment
    // validateEnvironment();
    
    // Initialize platform wallet
    // await initializePlatformWallet();
    
    // Setup all routes
    setupTipRoute(app);
    setupHealthRoute(app);
    setupRatesRoute(app);
    
    logger.info(`x402 Tipping routes setup complete`);
    logger.info(`Available endpoints:`);
    logger.info(`  POST /tip - Process tip payment (requires x402 payment)`);
    logger.info(`  GET /health - Health check`);
    logger.info(`  GET /rates - Get tipping rates`);
    
  } catch (error) {
    logger.error('Failed to setup x402 routes:', error);
    throw error;
  }
}; 

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupX402Routes(app);

app.listen(5001, () => {
  logger.info('Tip server listening on port 5001');
});