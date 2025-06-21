# GitTipStream MCP Server - x402 + CDP Integration

> **🏆 Hackathon Entry**: Transform any AI agent into a payment-enabled tipping agent using x402 payment collection with CDP automatic disbursement.

## 🚀 Quick Demo (No Setup Required)

Experience the x402 + CDP tipping flow instantly:

```bash
git clone <this-repo>
cd mcp-server
npm install
NODE_ENV=demo npm start
```

**That's it!** The server runs in demo mode, showing simulated x402 + CDP transactions.

## 🎯 What This Does

**Core Innovation**: ANY AI agent + this MCP = instant payment-enabled agent

- **x402 Payment Collection**: Users pay from dedicated wallets
- **CDP Automatic Disbursement**: Backend splits payments (96% recipient, 4% platform)
- **MCP Tool Integration**: Works with Claude, ChatGPT, or any MCP-compatible agent
- **True Composability**: Plug into any AI agent for instant payment capabilities

## 🏗️ Architecture

### Payment Flow
```
User → Dedicated Tipping Wallet → x402 Payment Collection → CDP Agent Wallet → CDP Disburses to Recipient (96%) + Platform (4%)
```

### Key Components
- **Dedicated User Wallets**: Generated per user, isolated from main wallets
- **x402 Payment Protocol**: Seamless USDC payments on Base/Ethereum  
- **CDP Wallet API**: Automatic backend splitting and routing
- **MCP Framework**: Universal AI agent integration

## 📋 MCP Tools Available

### Core Tipping
- **`tip_user_x402`**: Send USDC tips via x402 → CDP flow
- **`check_tipping_balance`**: Check wallet balance and create new wallets
- **`get_user_wallet_types`**: Get user's configured wallet types

### Wallet Management  
- **`export_tipping_wallet`**: Export private key for full control
- **`withdraw_tipping_funds`**: Sweep all funds to main wallet

### Utility
- **`ping`**: Health check endpoint

## 🎮 User Experience

### First Time Setup
```
User: "Tip alice 5 USDC"
Agent: "🔐 Generated your dedicated wallet: 0xABC123... Please fund with USDC"
User: [funds wallet]
User: "Tip alice 5 USDC" (retry)
Agent: "✅ Tipped alice 5 USDC! (4.80 to alice, 0.20 platform fee)"
```

### Ongoing Usage
```
User: "Tip bob 3 USDC" → Agent: "✅ Done! Remaining balance: 42 USDC"
User: "Check balance" → Agent: "47.50 USDC available"
User: "Withdraw all" → Agent: "✅ Sent 47.50 USDC to your main wallet"
```

## 🛠️ Integration Modes

### 1. Demo Mode (Default)
Perfect for hackathon judges and testing:

```bash
NODE_ENV=demo npm start
```

**Features:**
- ✅ No database setup required
- ✅ Simulated x402 + CDP responses  
- ✅ Shows full payment flow
- ✅ Instant setup for evaluation

### 2. Production Mode
Full integration with tip.md platform:

```bash
# Requires MongoDB and CDP credentials
NODE_ENV=production npm start
```

**Requirements:**
- MongoDB URI for user database
- CDP API credentials for real transactions
- Main GitTipStream server running

## 📦 Installation & Setup

### Quick Start (Demo)
```bash
npm install
cp .env.example .env
# Keep NODE_ENV=demo in .env
npm start
```

### Production Integration
```bash
npm install
cp .env.example .env
# Edit .env with your credentials:
# - MONGODB_URI=your_mongodb_connection
# - CDP_API_KEY_ID=your_cdp_key
# - CDP_PRIVATE_KEY=your_cdp_private_key
# - NODE_ENV=production
npm start
```

## 🔧 Environment Configuration

Create `.env` file:

```bash
# Demo Mode (default)
NODE_ENV=demo

# Production Mode (requires setup)
# NODE_ENV=production
# MONGODB_URI=mongodb+srv://...
# CDP_API_KEY_ID=your_key
# CDP_PRIVATE_KEY=your_private_key

# Server Configuration
PORT=5001
MCP_PORT=5003
```

## 🎯 Hackathon Alignment

Perfect match for **"Best Use of x402pay + CDP Wallet"**:

- ✅ **x402pay**: Dedicated user wallet payment collection
- ✅ **CDP Wallet**: Automatic disbursement + platform fee splitting  
- ✅ **Agent Integration**: Any AI agent can plug in for instant payments
- ✅ **Real-world Use**: GitHub contributor tipping ecosystem
- ✅ **Composability**: Reusable payment infrastructure

## 🔐 Security & Custody

- **Non-custodial**: Users control their private keys
- **Dedicated Wallets**: Isolated tipping funds, not main wallet exposure  
- **Full Recovery**: Users can export private keys or withdraw anytime
- **Transparent Fees**: Clear 4% platform fee with 96% to recipients

## 🧪 Technical Implementation

### x402 Payment Integration
```typescript
// Each user's dedicated wallet pays via x402
const account = privateKeyToAccount(userWallet.privateKey);
const x402Client = withPaymentInterceptor(axios.create({ 
  baseURL: 'https://tip.md' 
}), account);

// This triggers x402 payment flow automatically
const response = await x402Client.post('/api/x402/tip', tipData);
```

### CDP Disbursement Backend
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

## 📡 API Endpoints

- **MCP Endpoint**: `http://localhost:5003/mcp`
- **x402 Payment**: `http://localhost:5001/tip`
- **Health Check**: `http://localhost:5003/ping`

## 🤝 Contributing

This is the standalone version for hackathon demonstration. For full integration:

1. The complete tip.md platform handles user management
2. The MongoDB database stores user and transaction data  
3. The CDP integration manages real USDC transfers

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Platform**: [tip.md](https://tip.md)
- **CDP Documentation**: [Coinbase Developer Platform](https://docs.cdp.coinbase.com/)
- **x402 Protocol**: [x402pay](https://x402pay.dev/)
- **MCP Framework**: [Model Context Protocol](https://modelcontextprotocol.io/)

---

**Built for the Coinbase x402 + CDP Hackathon** 🏆 