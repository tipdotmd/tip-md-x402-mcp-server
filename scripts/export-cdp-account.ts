// scripts/export-cdp-account.ts
import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";

dotenv.config();

async function exportAccount() {
  try {
    console.log('🔧 Initializing CDP client...');
    const cdp = new CdpClient();

    const targetAddress = process.env.CDP_AGENT_ADDRESS! as `0x${string}`;
    console.log('📋 Target Account Address:', targetAddress);

    // First, load the account to verify it exists
    console.log('🔍 Loading account by address...');
    const account = await cdp.evm.getAccount({ 
      address: targetAddress
    });
    console.log(`✅ Found account: ${account.address}`);

    // Export the private key using the address
    console.log('🔑 Exporting private key...');
    const privateKey = await cdp.evm.exportAccount({
      address: targetAddress
    });

    console.log('✅ Account exported successfully!');
    console.log('🔑 Private Key:', privateKey);
    console.log('📋 Address:', targetAddress);
    
    console.log('\n💡 You can now use this private key with viem or other libraries');
    console.log('⚠️  Keep this private key secure and never share it!');
    
  } catch (error) {
    console.error('❌ Error exporting account:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure CDP_API_KEY_ID and CDP_API_KEY_SECRET are set in .env');
    console.log('2. Ensure CDP_AGENT_ADDRESS is correct');
    console.log('3. Verify the account exists and you have access to it');
  }
}

// Run the export
exportAccount(); 