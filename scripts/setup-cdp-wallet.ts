// scripts/setup-cdp-wallet.ts
import { CdpClient } from '@coinbase/cdp-sdk';
import dotenv from 'dotenv';

dotenv.config();

async function setupAgentWallet() {
  // Initialize the CDP client (automatically loads API keys from environment)
  const cdp = new CdpClient();
  
  // Create EVM account for Base/Ethereum (x402 only supports these networks)
  const account = await cdp.evm.createAccount();
  console.log('EVM Account Created:', account.address);
  
  // Fund account for production use
  console.log('EVM Account ready for mainnet:', account.address);
  console.log('⚠️  Fund this account with real USDC before going live');
  console.log('⚠️  Save this address for CDP_AGENT_ADDRESS environment variable:', account.address);
}

setupAgentWallet().catch(console.error); 