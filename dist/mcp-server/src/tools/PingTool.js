import { MCPTool } from "mcp-framework";
// Local logger for this tool
const toolLogger = {
    info: (...args) => console.log('[PingTool]', ...args),
    error: (...args) => console.error('[PingTool ERROR]', ...args),
    warn: (...args) => console.warn('[PingTool WARN]', ...args),
    debug: (...args) => console.debug('[PingTool DEBUG]', ...args)
};
// Use the correct class name matching the file, or rename file later
export default class PingtoolTool extends MCPTool {
    name = "ping"; // Use consistent lowercase name
    description = "Responds with pong, useful for health checks.";
    // Use an empty object for schema if no parameters
    schema = {};
    constructor() {
        super();
    }
    async execute(input) {
        toolLogger.info('Received ping request');
        return 'pong';
    }
}
