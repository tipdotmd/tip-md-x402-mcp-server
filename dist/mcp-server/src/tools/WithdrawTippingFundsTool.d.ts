import { MCPTool } from "mcp-framework";
import { z } from 'zod';
declare const WithdrawSchema: z.ZodObject<{
    tipMdUserId: z.ZodString;
    destinationAddress: z.ZodString;
    amount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    tipMdUserId: string;
    amount: number;
    destinationAddress: string;
}, {
    tipMdUserId: string;
    amount: number;
    destinationAddress: string;
}>;
type WithdrawTippingFundsParams = z.infer<typeof WithdrawSchema>;
interface WithdrawResult {
    success: boolean;
    operation: string;
    data?: {
        userId: string;
        amount: number;
        destinationAddress: string;
        network: string;
        sourceAddress: string;
        transactionHash: string;
        remainingBalance: number;
        estimatedConfirmation: string;
        timestamp: string;
    };
    error?: {
        code: string;
        message: string;
        details?: string;
    };
    message: string;
}
export default class WithdrawTippingFundsTool extends MCPTool<WithdrawTippingFundsParams> {
    name: string;
    description: string;
    schema: z.ZodObject<{
        tipMdUserId: z.ZodString;
        destinationAddress: z.ZodString;
        amount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        tipMdUserId: string;
        amount: number;
        destinationAddress: string;
    }, {
        tipMdUserId: string;
        amount: number;
        destinationAddress: string;
    }>;
    constructor();
    private validateEnvironment;
    execute(params: WithdrawTippingFundsParams, context?: {
        sessionId?: string;
    }): Promise<WithdrawResult>;
}
export {};
//# sourceMappingURL=WithdrawTippingFundsTool.d.ts.map