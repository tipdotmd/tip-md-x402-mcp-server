// scripts/list-cdp-accounts.ts
import { CdpClient } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";

dotenv.config();

async function listCdpAccounts() {
  try {
    console.log('🔧 Initializing CDP client...');
    const cdp = new CdpClient();
    
    console.log('📋 Looking for CDP accounts...');
    let response = await cdp.evm.listAccounts();
    
    let accountCount = 0;
    
    // Paginate through all accounts
    while (true) {
      for (const account of response.accounts) {
        accountCount++;
        console.log(`\n📍 Account ${accountCount}:`);
        console.log(`   Address: ${account.address}`);
        console.log(`   Name: ${account.name || 'Unnamed'}`);
        
        // Check if this matches your funded wallet
        if (account.address.toLowerCase() === process.env.CDP_AGENT_ADDRESS?.toLowerCase()) {
          console.log(`   🎯 THIS IS YOUR FUNDED WALLET! ✅`);
        }
      }
      
      if (!response.nextPageToken) break;
      
      response = await cdp.evm.listAccounts({
        pageToken: response.nextPageToken
      });
    }
    
    console.log(`\n📊 Total accounts found: ${accountCount}`);
    console.log(`🔍 Looking for: ${process.env.CDP_AGENT_ADDRESS}`);
    
    if (accountCount === 0) {
      console.log('\n💡 No accounts found. This could mean:');
      console.log('1. Wrong API credentials');
      console.log('2. Your funded wallet was created differently');
      console.log('3. Need to import existing wallet using private key');
    }
    
  } catch (error) {
    console.error('❌ Error listing CDP accounts:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
}

// Run the listing
listCdpAccounts(); 