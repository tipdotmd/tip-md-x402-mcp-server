import { MCPTool } from "mcp-framework";
type PingParams = {};
export default class PingtoolTool extends MCPTool<PingParams> {
    name: string;
    description: string;
    schema: {};
    constructor();
    execute(input: PingParams): Promise<string>;
}
export {};
//# sourceMappingURL=PingTool.d.ts.map