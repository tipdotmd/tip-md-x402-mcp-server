# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Information
- **Repository**: tip.md x402 + CDP MCP Server  
- **Type**: Model Context Protocol (MCP) server with x402 payment integration
- **Main Branch**: main
- **Node Version**: >=18.19.0

## Common Commands

```bash
# Build and development commands
npm run build          # Compile TypeScript to dist/
npm run clean          # Remove dist/ directory  
npm run rebuild        # Clean and build
npm run watch          # Build in watch mode

# Running the server
npm start              # Start compiled server (production)
npm run start:prod     # Start with NODE_ENV=production
npm run deploy         # Rebuild and start in production mode

# Demo mode (for testing without real payments)
NODE_ENV=demo npm start    # Run server with simulated payments
```

## Architecture Overview

This is an **MCP (Model Context Protocol) server** that integrates **x402 payment protocol** with **Coinbase Developer Platform (CDP)** to enable cryptocurrency tipping through AI agents.

### Core Components

**MCP Framework Integration**:
- Uses `mcp-framework` library for HTTP-stream transport
- Exposes 7 MCP tools for AI agents to use
- Session-enabled for user identification
- CORS-configured for web clients

**Payment Flow Architecture**:
```
User → AI Agent → MCP Tool → x402 Payment Collection → CDP Automatic Disbursement
                                      ↓
                           User's Dedicated Tipping Wallet → CDP Agent Wallet → Split to Recipient (96%) + Platform (4%)
```

**Key Directories**:
- `src/` - Main TypeScript source code
- `src/tools/` - MCP tool implementations (7 tools total)
- `src/server/` - x402 payment server and MCP server setup
- `database/` - MongoDB connection and user repository (JavaScript)
- `scripts/` - CDP wallet management scripts
- `dist/` - Compiled JavaScript output

### MCP Tools Available

1. **`mcp_tip_md_tip_user_x402`** - Core x402 tipping with CDP disbursement
2. **`mcp_tip_md_check_tipping_balance`** - Check/create user tipping wallet
3. **`mcp_tip_md_export_tipping_wallet`** - Export wallet private key
4. **`mcp_tip_md_withdraw_tipping_funds`** - Withdraw from tipping wallet
5. **`mcp_tip_md_get_user_wallet_types`** - Get user's supported wallets
6. **`mcp_tip_md_crypto_tipping`** - Manual crypto tipping info
7. **`mcp_tip_md_ping`** - Health check

### Technology Stack

**Blockchain Integration**:
- **x402 Protocol**: HTTP 402 Payment Required standard
- **CDP SDK**: Coinbase Developer Platform for automated transactions
- **Viem**: Ethereum interaction library
- **Base Network**: Primary blockchain for transactions

**Server Framework**:
- **Express.js**: HTTP server layer
- **mcp-framework**: MCP protocol implementation
- **MongoDB**: User and wallet data persistence
- **TypeScript**: Primary language with strict typing

## Environment Configuration

**Required for Production**:
```bash
MONGODB_URI=mongodb+srv://...           # Database connection
CDP_API_KEY_ID=your_cdp_api_key_id     # Coinbase Developer Platform API
CDP_API_KEY_SECRET=your_secret          # CDP API secret
CDP_AGENT_ADDRESS=0x...                 # Funded CDP wallet address
VITE_MAINNET_ETH_PLATFORM_WALLET=0x... # Platform fee recipient
```

**Optional**:
```bash
MCP_PORT=5003                          # MCP server port (default: 5003)
NODE_ENV=production|demo|development    # Environment mode
LOG_LEVEL=info|debug|warn|error        # Logging level
```

## Development Guidelines

### Code Organization
- **MCP Tools**: Each tool in `src/tools/` extends `MCPTool` class
- **Database Layer**: JavaScript files in `database/` (legacy, not TypeScript)
- **Type Safety**: All new code should use TypeScript with strict typing
- **Error Handling**: Use structured error responses for MCP tools

### Payment Integration Patterns
- **x402 Verification**: Use `paymentMiddleware` from `x402-express`
- **CDP Transactions**: Use CDP SDK for blockchain operations
- **Demo Mode**: Support `NODE_ENV=demo` for testing without real payments
- **Session Management**: Track users via MCP session headers

### Testing Approach
- **Demo Mode**: Set `NODE_ENV=demo` for payment simulation
- **MCP Clients**: Test with Cursor, Claude Desktop, or other MCP-compatible tools
- **Health Checks**: Use `/health` endpoint for server status
- **Manual Testing**: Use provided scripts in `scripts/` directory

### Database Patterns
- **Read-Only**: UserRepository provides read-only access to user data
- **Caching**: 5-minute TTL cache for frequently accessed users
- **Connection Management**: Singleton pattern for MongoDB connection

## Build System Details

**TypeScript Configuration**:
- Target: ESNext with ESNext modules
- Output: `dist/` directory with declaration files
- Module Resolution: Bundler style
- Path Mapping: `@shared/*` for shared schemas

**Import/Export Pattern**:
- Use ES modules (`.js` extensions in imports)
- CommonJS compatibility via esModuleInterop
- Dynamic imports for optional dependencies

## MCP Client Integration

**Endpoint**: `http://localhost:5003/mcp`
**Transport**: HTTP-stream
**Session Header**: `Mcp-Session-Id`

**Example MCP Client Config**:
```json
{
  "mcpServers": {
    "tip-md": {
      "command": "node",
      "args": ["dist/mcp-server/src/index.js"],
      "env": {
        "NODE_ENV": "demo"
      }
    }
  }
}
```

## Security Considerations

- **Private Keys**: Never log or expose wallet private keys
- **Environment Variables**: Use proper .env management
- **Payment Verification**: Always verify x402 payments before service delivery
- **Session Management**: Implement proper user identification
- **Rate Limiting**: Consider implementing for production deployments

## Debugging and Monitoring

**Logging**: Structured logging with different levels
**Health Monitoring**: ETH balance alerts for platform wallet
**Transaction Tracking**: Full transaction hash logging
**MCP Session Tracking**: User session management for debugging
**Demo Mode**: Full simulation logging for development/testing