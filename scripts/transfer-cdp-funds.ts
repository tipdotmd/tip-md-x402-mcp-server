import { CdpClient } from '@coinbase/cdp-sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function transferCdpFunds() {
  try {
    console.log('🔧 Initializing CDP client...');
    
    // Initialize the CDP client (automatically loads API keys from environment)
    const cdp = new CdpClient();

    console.log('📋 CDP Agent Address:', process.env.CDP_AGENT_ADDRESS);
    
    // Load your MCP tipping wallet details
    const tippingWalletPath = path.join(process.cwd(), 'mcp-server', 'wallets', 'default_user_tipping.json');
    
    if (!fs.existsSync(tippingWalletPath)) {
      throw new Error('❌ MCP tipping wallet not found. Please call an MCP tool first to create it.');
    }
    
    const tippingWalletData = JSON.parse(fs.readFileSync(tippingWalletPath, 'utf8'));
    const destinationAddress = tippingWalletData.address;
    
    console.log('💳 MCP Tipping Wallet Address:', destinationAddress);

    // Try to get the account using the specific address
    console.log('🔍 Loading account by address...');
    const fundedAccount = await cdp.evm.getAccount({ 
      address: process.env.CDP_AGENT_ADDRESS! as `0x${string}`
    });
    console.log(`✅ Loaded account: ${fundedAccount.address}`);

    // Transfer 1 USDC using CDP SDK's built-in transfer method
    console.log(`\n🚀 Ready to transfer 1 USDC`);
    console.log(`📤 From: ${fundedAccount.address} (Your CDP wallet)`);
    console.log(`📥 To: ${destinationAddress}`);
    console.log(`🌐 Network: Base Mainnet`);
    
    console.log(`\n⚡ Transferring 1 USDC...`);
    
    // Use CDP SDK's built-in transfer method
    const { transactionHash } = await fundedAccount.transfer({
      to: destinationAddress,
      amount: 1000000n, // 1 USDC (6 decimals)
      token: "usdc",
      network: "base"
    });
    
    console.log('✅ Transfer completed!');
    console.log('🔗 Transaction hash:', transactionHash);
    console.log(`💳 Transferred 1 USDC to your MCP tipping wallet`);
    console.log(`🔗 Explorer: https://basescan.org/tx/${transactionHash}`);
    
    console.log('\n🎉 Success! You can now use your MCP tipping tools with funded wallet.');
    
  } catch (error) {
    console.error('❌ Error transferring funds:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure CDP_API_KEY_ID and CDP_API_KEY_SECRET are set in .env');
    console.log('2. Ensure CDP_AGENT_ADDRESS has USDC balance on Base network');
    console.log('3. Verify your CDP account has permission to send transactions');
    console.log('4. Check that the CDP account is properly funded');
    
    console.log('\n📋 Manual Transfer Instructions:');
    console.log(`📤 From: ${process.env.CDP_AGENT_ADDRESS}`);
    
    // Load and show destination address
    try {
      const tippingWalletPath = path.join(process.cwd(), 'mcp-server', 'wallets', 'default_user_tipping.json');
      if (fs.existsSync(tippingWalletPath)) {
        const tippingWalletData = JSON.parse(fs.readFileSync(tippingWalletPath, 'utf8'));
        console.log(`📥 To: ${tippingWalletData.address}`);
      }
    } catch (e) {
      console.log('📥 To: [Run an MCP tool first to create tipping wallet]');
    }
    
    console.log(`🌐 Network: Base Mainnet`);
    console.log(`💰 Token: USDC`);
    console.log(`💵 Amount: 1 USDC`);
  }
}

// Run the transfer
transferCdpFunds(); 