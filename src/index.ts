import { MCPServer } from "mcp-framework";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupX402Routes } from './server/x402-server.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// In production, environment variables should be set in the environment
// In development, load from .env file
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(projectRoot, '.env') });
  console.log('Loaded environment from .env file');
} else {
  console.log('Running in production mode');
}

// Basic Logger Setup
export const logger = {
  info: (...args: any[]) => console.log('[MCP Server]', ...args),
  error: (...args: any[]) => console.error('[MCP Server ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[MCP Server WARN]', ...args),
  debug: (...args: any[]) => process.env.NODE_ENV !== 'production' ? console.debug('[MCP Server DEBUG]', ...args) : null,
};

// Define server configuration
const MCP_PORT = parseInt(process.env.MCP_PORT || '5003', 10);
// Read name/version from package.json or set defaults
const SERVER_NAME = process.env.npm_package_name || 'mcp-server';
const SERVER_VERSION = process.env.npm_package_version || '0.0.1';

// Initialize MCPServer with HTTP Stream transport and proper session management
const server = new MCPServer({
  name: SERVER_NAME,
  version: SERVER_VERSION,
  transport: {
    type: "http-stream",
    options: {
      port: MCP_PORT,
      endpoint: "/mcp",
      
      // Enable session management for user identification
      session: {
        enabled: true,                    // Enable session tracking
        headerName: "Mcp-Session-Id",     // Header name for session ID
        allowClientTermination: true      // Allow clients to end sessions
      },
      
      // Configure response handling
      responseMode: "batch",              // Use batch mode for better performance
      batchTimeout: 30000,                // 30 second timeout for responses
      maxMessageSize: 4 * 1024 * 1024,   // 4MB in bytes
      
      // CORS configuration for web clients
      cors: {
        allowOrigin: "*",                 // Allow all origins (adjust for production)
        allowMethods: "GET, POST, OPTIONS",
        allowHeaders: "Content-Type, Authorization, Mcp-Session-Id",
        exposeHeaders: "Mcp-Session-Id"   // Expose session ID to clients
      }
    }
  }
});

logger.info(`MCP Server (mcp-framework) "${SERVER_NAME}" v${SERVER_VERSION}" initializing...`);

let isShuttingDown = false;

async function startServer() {
  try {
    // Start the MCP server first
    await server.start();
    
    if (isShuttingDown) return; // Don't continue if shutdown started
    logger.info(`✅ MCP Server listening on port ${MCP_PORT}`);
    
    // Now attempt to get the underlying HTTP server from the MCP server
    // and add x402 routes to it
    const httpServer = (server as any).transport?.server?.httpServer;
    if (httpServer) {
      // Get the Express app from the HTTP server
      const app = httpServer._events?.request || httpServer.listeners('request')[0];
      if (app && typeof app.use === 'function') {
        if (isShuttingDown) return; // Don't continue if shutdown started
        await setupX402Routes(app);
        if (isShuttingDown) return; // Don't log if shutdown started
        logger.info(`✅ x402 routes integrated into MCP server`);
      } else {
        if (!isShuttingDown) logger.warn('Could not access Express app to add x402 routes');
      }
    } else {
      if (!isShuttingDown) logger.warn('Could not access HTTP server to add x402 routes');
    }
    
    if (!isShuttingDown) {
      logger.info(`🎯 Ready for x402 → CDP tipping via MCP tools!`);
      logger.info(`📡 MCP endpoint: http://localhost:${MCP_PORT}/mcp`);
      logger.info(`💰 x402 payment endpoint: http://localhost:${MCP_PORT}/tip`);
    }
    
  } catch (error) {
    if (!isShuttingDown) {
      logger.error('Failed to start servers:', error);
      process.exit(1);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  isShuttingDown = true;
  // The MCP framework handles the actual server shutdown
});

process.on('SIGTERM', () => {
  isShuttingDown = true;
});

startServer();