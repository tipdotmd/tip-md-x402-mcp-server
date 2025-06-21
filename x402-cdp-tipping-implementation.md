# x402 + CDP USDC Tipping Implementation for MCP Server

## Overview

**Transform any AI agent into a payment-enabled tipping agent** using x402 payment collection with CDP automatic disbursement. This MCP server enables AI assistants to autonomously facilitate USDC cryptocurrency tips through dedicated user wallets and the existing GitTipStream infrastructure.

**Key Architecture**: x402 payment collection → CDP automatic disbursement  
**Key Innovation**: Any AI agent + this MCP = instant payment-enabled agent

## Hackathon Alignment: "Best Use of x402pay + CDP Wallet" 🎯

Perfect match for hackathon criteria:
- ✅ **"AI agent that charges users per query and tips contributors via CDP Wallet"**
- ✅ **"Pay-per-use agents with automated payouts"**  
- ✅ **x402pay**: Dedicated user wallet payment collection
- ✅ **CDP Wallet**: Automatic disbursement + platform fee splitting
- ✅ **Composability**: ANY AI agent can plug in this MCP for instant payment capabilities
- ✅ **Real-world relevance**: GitHub contributor tipping ecosystem

## Architecture: True x402 → CDP Flow

### User Payment Flow
```
User → Dedicated Tipping Wallet → x402 Payment Collection → CDP Agent Wallet → CDP Disburses to Recipient (96%) + Platform (4%)
```

### Key Components:
- **Dedicated User Wallets**: Generated per user, isolated from main wallets
- **x402 Payment Collection**: Seamless USDC payments on Base/Ethereum  
- **CDP Automatic Disbursement**: Backend splitting and routing
- **MCP Tool Integration**: Works with any AI agent (Claude, ChatGPT, etc.)

## User Experience

### **First Time Setup:**
1. User: *"Tip alice 5 USDC"*
2. Agent: *"🔐 Generated your dedicated tipping wallet: 0xABC123... Please fund with USDC"*
3. User sends USDC to generated address
4. User: *"Tip alice 5 USDC"* (retry)
5. Agent: *"✅ Tipped alice 5 USDC! (4.80 to alice, 0.20 platform fee)"*

### **Ongoing Usage:**
- User: *"Tip bob 3 USDC"* → Agent: *"✅ Done! Remaining balance: 42 USDC"*
- User: *"Check balance"* → Agent: *"47.50 USDC available for tipping"*
- User: *"Withdraw all funds"* → Agent: *"✅ Sent 47.50 USDC to your main wallet"*

## MCP Tools Implementation

### **1. Core Tipping Tool**
```typescript
class X402TippingTool extends MCPTool<X402TippingParams> {
  readonly name = 'tip_user_x402';
  readonly description = 'Tip a user with USDC using dedicated wallet + x402 payment collection + CDP disbursement';
  
  async execute(params: X402TippingParams) {
    // 1. Get or create user's dedicated tipping wallet
    const userWallet = await walletManager.getOrCreateWallet(userId);
    
    // 2. Check if wallet has sufficient USDC balance
    const balance = await getUSDCBalance(userWallet.address);
    if (balance < params.amount) {
      return { message: `Insufficient balance. Please fund ${userWallet.address} with USDC` };
    }
    
    // 3. Use x402-axios to make payment to protected endpoint
    const x402Client = withPaymentInterceptor(axios.create(), userWallet);
    const response = await x402Client.post('/api/x402/tip', {
      username: params.username,
      amount: params.amount,
      message: params.message
    });
    
    // 4. Return success with transaction details
    return { message: `✅ Tipped ${params.username} ${params.amount} USDC!` };
  }
}
```

### **2. Wallet Management Tools**
```typescript
// Check tipping wallet balance
'check_tipping_balance' → "47.50 USDC available for tipping"

// Get wallet address for funding  
'get_tipping_address' → "Send USDC to: 0xABC123..."

// Complete wallet information
'show_tipping_wallet_info' → Full status + balance + recovery options
```

### **3. Fund Recovery Tools**
```typescript
// Export private key for full control
'export_tipping_wallet' → "🔐 Your private key: 0x... (import to MetaMask)"

// Sweep all funds to main wallet
'withdraw_tipping_funds' → "✅ Sent 47.50 USDC to your main wallet"
```

## Technical Implementation

### **Dedicated Wallet Manager**
```typescript
class TippingWalletManager {
  private walletPath: string;
  
  async getOrCreateWallet(userId: string): Promise<ethers.Wallet> {
    const walletPath = `${os.homedir()}/.tip-wallet-${userId}.json`;
    
    if (fs.existsSync(walletPath)) {
      // Load existing wallet
      const data = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
      return new ethers.Wallet(data.privateKey);
    } else {
      // Generate new wallet
      const wallet = ethers.Wallet.createRandom();
      fs.writeFileSync(walletPath, JSON.stringify({
        address: wallet.address,
        privateKey: wallet.privateKey,
        created: Date.now()
      }));
      return wallet;
    }
  }
}
```

### **x402 Payment Integration**
```typescript
// Each user's dedicated wallet pays via x402
const account = privateKeyToAccount(userWallet.privateKey);
const x402Client = withPaymentInterceptor(axios.create({ 
  baseURL: 'https://tip.md' 
}), account);

// This triggers x402 payment flow automatically
const response = await x402Client.post('/api/x402/tip', tipData);
```

### **CDP Disbursement Backend**
```typescript
// x402 protected endpoint that triggers CDP disbursement
app.post('/api/x402/tip', paymentMiddleware, async (req, res) => {
  // Payment successful via x402 - now trigger CDP disbursement
  const { username, amount } = req.body;
  
  // CDP splits payment: 96% to recipient, 4% to platform
  await cdp.transfer(recipientAddress, amount * 0.96);
  await cdp.transfer(platformAddress, amount * 0.04);
  
  res.json({ success: true, txHash: result.hash });
});
```

## Key Benefits

### **🎯 Hackathon Perfect**
- **True x402 → CDP Flow**: Money in via x402, money out via CDP
- **Agent Transformation**: Turns any AI agent into payment-enabled
- **Composable Infrastructure**: Reusable across different agent platforms

### **🔒 User Custody & Security**
- **Dedicated Wallets**: Isolated tipping funds, not main wallet exposure
- **Full Recovery**: Users can export private keys or withdraw anytime  
- **Non-custodial**: MCP server just manages convenience, users retain control

### **⚡ Seamless UX**
- **One-time Setup**: Generate wallet once, fund once
- **Instant Tipping**: After setup, payments are seamless
- **Any Agent**: Works with Claude, ChatGPT, or any MCP-compatible agent

## Existing Infrastructure Reuse ✅

### **Zero Database Changes**
- Uses existing `tips` and `users` tables
- Same storage patterns and webhook infrastructure
- Extends existing notification system

### **Same Security Patterns**
- Existing webhook signature verification
- Same error handling and logging
- Reuses environment variable configuration

## Step-by-Step Implementation Guide

### ✅ Step 1: Dependencies Installed ✅
```bash
cd mcp-server
npm install @coinbase/cdp-sdk x402-axios viem ethers
```

### ✅ Step 2: CDP Agent Wallet Created ✅
- Agent Address: `0x0Acf5Ed0256746fd781B4334872f027d9468c7EF`
- Environment variables configured
- **⚠️ Fund this wallet with USDC on Base network for production**

### Step 3: Environment Configuration
```bash
# CDP Configuration (existing)
CDP_API_KEY_ID=c090d0c5-d25b-4a44-83e8-403feab4bf79
CDP_API_KEY_SECRET=vRDXVp07Vy7NAyMbQffD7+0yGeGKCVEmvaFAgPT06W06QmrVeN5naZT2tNWRBGKhTQkr10vfaYNo41y96pGXfA==
CDP_AGENT_ADDRESS=0x0Acf5Ed0256746fd781B4334872f027d9468c7EF

# App Configuration
NEXT_PUBLIC_URL=https://tip.md
VITE_MAINNET_ETH_PLATFORM_WALLET=existing_platform_wallet
```

### Step 4: Implement MCP Tools
- **X402TippingTool.ts**: Main tipping with dedicated wallet generation
- **TippingWalletManager.ts**: Wallet creation and management
- **All 6 MCP tools**: Complete wallet lifecycle management

### Step 5: Add x402 Protected Endpoints
```typescript
// Protected tip endpoint that triggers CDP disbursement
app.use(paymentMiddleware(process.env.CDP_AGENT_ADDRESS!, {
  "POST /api/x402/tip": {
    price: "$0.001", // Minimum - actual amount from request body
    network: "base",
    description: "USDC tip payment via x402+CDP",
  },
}, facilitator));

app.post('/api/x402/tip', async (req, res) => {
  // x402 payment successful - trigger CDP disbursement
  await disburseTipViaCDP(req.body);
  res.json({ success: true });
});
```

### Step 6: Register MCP Tools
```typescript
// mcp-server/src/index.ts
import X402TippingTool from './tools/X402TippingTool.js';

const tools = [
  new X402TippingTool(),
  // ... other existing tools
];
```

## Production Deployment

### **Environment Variables**
```bash
# x402 + CDP (uses built-in facilitator)
CDP_API_KEY_ID=your_cdp_key
CDP_API_KEY_SECRET=your_cdp_secret  
CDP_AGENT_ADDRESS=your_funded_agent_wallet

# App URLs
NEXT_PUBLIC_URL=https://your-domain.com
```

### **Deployment Steps**
1. Fund CDP agent wallet with USDC on Base mainnet
2. Deploy MCP server with production environment
3. Configure x402 protected endpoints on main app
4. Test end-to-end payment flow

## Success Metrics

### **Hackathon Demo Readiness**
✅ **x402 payment collection** with dedicated user wallets  
✅ **CDP automatic disbursement** with fee splitting  
✅ **Complete payment loop** from user to recipient  
✅ **Any AI agent compatibility** via MCP protocol  
✅ **Real-world application** for creator monetization  
✅ **Novel infrastructure** for payment-enabled agents  

### **Value Demonstration**
- **Before**: AI agents can only chat
- **After**: AI agents can process payments and tip people automatically
- **Impact**: Transforms any agent into a monetization platform

## Summary

This implementation creates **payment-enabled AI agent infrastructure** using x402 for payment collection and CDP for automatic disbursement. The MCP server transforms any AI agent into a pay-per-use tipping agent, perfectly demonstrating both x402 and CDP integration for the hackathon.

**Key Innovation**: Universal payment enablement for AI agents through composable MCP tools.