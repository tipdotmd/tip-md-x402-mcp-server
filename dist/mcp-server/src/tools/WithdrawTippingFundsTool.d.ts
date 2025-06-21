import { MCPTool } from "mcp-framework";
import { z } from 'zod';
declare const WithdrawSchema: z.ZodObject<{
    tipMdUserId: z.ZodString;
    destinationAddress: z.ZodString;
    amount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    amount: number;
    tipMdUserId: string;
    destinationAddress: string;
}, {
    amount: number;
    tipMdUserId: string;
    destinationAddress: string;
}>;
type WithdrawTippingFundsParams = z.infer<typeof WithdrawSchema>;
export default class WithdrawTippingFundsTool extends MCPTool<WithdrawTippingFundsParams> {
    name: string;
    description: string;
    schema: z.ZodObject<{
        tipMdUserId: z.ZodString;
        destinationAddress: z.ZodString;
        amount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        tipMdUserId: string;
        destinationAddress: string;
    }, {
        amount: number;
        tipMdUserId: string;
        destinationAddress: string;
    }>;
    constructor();
    execute(params: WithdrawTippingFundsParams, context?: {
        sessionId?: string;
    }): Promise<string>;
}
export {};
//# sourceMappingURL=WithdrawTippingFundsTool.d.ts.map