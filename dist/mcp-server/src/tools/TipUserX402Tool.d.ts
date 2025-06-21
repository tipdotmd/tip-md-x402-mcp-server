import { MCPTool } from "mcp-framework";
import { z } from 'zod';
declare const TipUserSchema: z.ZodObject<{
    tipMdUserId: z.ZodString;
    username: z.ZodString;
    amount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    username: string;
    amount: number;
    tipMdUserId: string;
}, {
    username: string;
    amount: number;
    tipMdUserId: string;
}>;
type TipUserParams = z.infer<typeof TipUserSchema>;
interface TipResult {
    success: boolean;
    operation: string;
    data?: {
        senderUserId: string;
        recipientUsername: string;
        amounts: {
            total: number;
            recipient: number;
            platformFee: number;
            platformFeePercentage: number;
        };
        network: string;
        protocol: string;
        transactions: {
            recipient: string;
            platform: string;
        };
        timestamp: string;
    };
    error?: {
        code: string;
        message: string;
        details?: string;
    };
    message: string;
}
export default class TipUserX402Tool extends MCPTool<TipUserParams> {
    name: string;
    description: string;
    schema: {
        tipMdUserId: {
            type: z.ZodString;
            description: string;
        };
        username: {
            type: z.ZodString;
            description: string;
        };
        amount: {
            type: z.ZodNumber;
            description: string;
        };
    };
    constructor();
    execute(input: TipUserParams): Promise<TipResult>;
    private getWalletAddress;
}
export {};
//# sourceMappingURL=TipUserX402Tool.d.ts.map