import { MCPTool } from "mcp-framework";
import { z } from "zod";

// Local logger for this tool
const toolLogger = {
  info: (...args: any[]) => console.log('[PingTool]', ...args),
  error: (...args: any[]) => console.error('[PingTool ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[PingTool WARN]', ...args),
  debug: (...args: any[]) => console.debug('[PingTool DEBUG]', ...args)
};

// Define the type for parameters, even if empty
type PingParams = {}; // No parameters needed

// Use the correct class name matching the file, or rename file later
export default class PingtoolTool extends MCPTool<PingParams> {
  name = "ping"; // Use consistent lowercase name
  description = "Responds with pong, useful for health checks.";
  
  // Use an empty object for schema if no parameters
  schema = {}; 

  constructor() {
    super();
  }

  async execute(input: PingParams): Promise<string> {
    toolLogger.info('Received ping request');
    return 'pong';
  }
}