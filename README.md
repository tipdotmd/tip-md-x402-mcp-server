# [tip.md](https://tip.md) x402 + CDP MCP Server

> **🏆 Hackathon Entry**: Transform any AI agent into a payment-enabled tipping agent using x402 payment collection with CDP automatic disbursement.

## 🌟 About tip.md

**tip.md** is a platform that allows developers to receive cryptocurrency tips directly to their wallets via a simple button embeddable in GitHub READMEs, websites, or any markdown content. It supports:

- **Multiple Blockchains**: Ethereum, Base,Solana, and Bitcoin Lightning Network
- **Direct-to-Wallet Payments**: Tips go straight to your wallet, no custody
- **Simple Integration**: One button, works everywhere markdown is supported
- **4% Platform Fee**: Transparent pricing, we only make money if you do
- **Client-Side Security**: All transactions processed securely in the browser

This MCP server extends tip.md's functionality by enabling **any AI agent** to facilitate crypto tipping through the innovative x402 + CDP integration.

## 🚀 Quick Demo (No Setup Required)

**For Judges & Evaluators**: Experience the x402 + CDP tipping flow instantly:

```bash
git clone https://github.com/xR0am/tip-md-x402-mcp-server.git
cd tip-md-x402-mcp-server
npm install
NODE_ENV=demo npm start
```

**⚠️ Important**: The server running alone shows logs, but to see the **demo payment functionality**, you need to connect it to an MCP client (see [Testing with MCP Clients](#testing-with-mcp-clients) below).

## 🎯 What This Does

**Core Innovation**: ANY AI agent + this MCP = instant payment-enabled agent

- **x402 Payment Collection**: Users pay from dedicated wallets using the x402 payment protocol (Money IN)
- **CDP Automatic Disbursement**: Backend automatically splits payments (96% recipient, 4% platform) via Coinbase Wallet API (Money OUT)
- **MCP Tool Integration**: Works with Claude, ChatGPT, Cursor, or any MCP-compatible agent
- **True Composability**: Transform existing AI workflows into payment-enabled experiences

### 🔄 The Complete Flow

1. **User asks AI agent**: "Tip @username 5 USDC"
2. **x402 Payment Collection**: Agent generates payment request, user pays from dedicated wallet
3. **CDP Automatic Disbursement**: Backend splits payment and sends to recipient + platform
4. **AI Confirms**: "✅ Sent 5 USDC to @username"

## 📋 Available MCP Tools

This MCP server exposes **7 tools** that any AI agent can use:

### **💰 x402 + CDP Payment Tools (Hackathon Innovation)**
- **`mcp_tip_md_tip_user_x402`**: Send USDC tips using x402 payment protocol with CDP automatic disbursement
- **`mcp_tip_md_check_tipping_balance`**: Check/create your dedicated x402 tipping wallet balance and info

### **🔧 Wallet Management Tools**  
- **`mcp_tip_md_export_tipping_wallet`**: Export your tipping wallet private key (security sensitive)
- **`mcp_tip_md_withdraw_tipping_funds`**: Withdraw USDC from your tipping wallet to any address

### **🔍 User & Network Tools**
- **`mcp_tip_md_get_user_wallet_types`**: Check recipient's supported cryptocurrencies and wallet types
- **`mcp_tip_md_crypto_tipping`**: Manual crypto tipping information for agents with wallet to instruct (Ethereum, Base, Solana - no x402/CDP flow)

### **🏥 System Tools**
- **`mcp_tip_md_ping`**: Health check endpoint

## 🧪 Testing with MCP Clients

To see the **actual demo payment functionality**, you need to connect the MCP server to a compatible client:

### Cursor IDE Setup

1. **Edit your MCP configuration** (`~/.cursor/mcp.json`):
```json
{
  "mcpServers": {
    "tip-md-demo": {
      "command": "node",
      "args": ["dist/mcp-server/src/index.js"],
      "cwd": "/path/to/tip-md-x402-mcp-server",
      "env": {
        "NODE_ENV": "demo"
      }
    }
  }
}
```

2. **Restart Cursor** and look for the 🔨 tools icon

3. **Test the demo**:
   - Type: "Tip user johndoe 5 USDC using base blockchain"
   - Watch the x402 + CDP simulation in action!

### Claude Desktop Setup

1. **Install Supergateway** (bridges our HTTP transport to stdio):
```bash
npm install -g supergateway
```

2. **Configure Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "tip-md-demo": {
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--httpStream",
        "http://localhost:3000/mcp",
        "--outputTransport",
        "stdio"
      ]
    }
  }
}
```

3. **Start the MCP server** in demo mode:
```bash
NODE_ENV=demo npm start
```

4. **Restart Claude Desktop** and test with: "Show me available tip.md tools"

### Other MCP Clients

For clients supporting HTTP-stream transport:
- **Endpoint**: `http://localhost:3000/mcp` (when running locally)
- **Transport**: HTTP-stream
- **Environment**: Set `NODE_ENV=demo` for simulation mode

## 🛠️ Production Integration (Requires Setup)

For full integration with the tip.md platform:

### Environment Variables

Create a `.env` file:

```bash
# Database Connection (Required for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Coinbase Developer Platform (Required for CDP disbursement)
CDP_API_KEY_ID=your_cdp_api_key_id
CDP_API_KEY_SECRET=your_cdp_api_key_secret

# x402 Configuration (Required for payment collection)
X402_WALLET_PRIVATE_KEY=your_x402_wallet_private_key

# Optional Configuration
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

### Production Deployment

```bash
npm install
npm run build
npm start
```

## 🏗️ Technical Architecture

### x402 Payment Collection
- **Dedicated Wallets**: Each user gets a unique payment wallet
- **Protocol Compliance**: Full x402 specification implementation
- **Multi-Chain Support**: Ethereum, Base, Solana networks

### CDP Automatic Disbursement  
- **Smart Splitting**: 96% to recipient, 4% to platform
- **Instant Settlement**: Automated via Coinbase Developer Platform
- **Multi-Token Support**: USDC, ETH, SOL, and more

### MCP Integration
- **Universal Compatibility**: Works with any MCP-compatible AI agent
- **Structured Responses**: Rich JSON responses for seamless integration
- **Error Handling**: Graceful fallbacks and detailed error messages

## 🎖️ Hackathon Submission Details

**Challenge**: Coinbase x402 + CDP Integration
**Innovation**: Universal AI agent payment enablement
**Demo Mode**: `NODE_ENV=demo npm start`
**Repository**: https://github.com/xR0am/tip-md-x402-mcp-server

### Key Differentiators

1. **Universal Agent Integration**: Any MCP client becomes payment-enabled
2. **Complete Payment Flow**: x402 collection + CDP disbursement in one solution
3. **Zero-Setup Demo**: Judges can evaluate immediately
4. **Production-Ready**: Already integrated with tip.md platform

## 📚 Learn More

- **tip.md Platform**: https://tip.md
- **MCP Protocol**: https://modelcontextprotocol.io
- **x402 Specification**: https://docs.coinbase.com/x402
- **Coinbase CDP**: https://docs.cdp.coinbase.com

## 🤝 Support

For questions about this hackathon entry:
- **Issues**: Open a GitHub issue
- **Email**: support@tip.md
- **Demo Problems**: Ensure you're testing through an MCP client, not just the server logs

---

**Built for the Coinbase x402 + CDP Hackathon** 🏆
