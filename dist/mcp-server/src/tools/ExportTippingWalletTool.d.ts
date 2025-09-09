import { MCPTool } from "mcp-framework";
import { z } from 'zod';
declare const ExportTippingWalletSchema: z.ZodObject<{
    tipMdUserId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    tipMdUserId: string;
}, {
    tipMdUserId: string;
}>;
type ExportTippingWalletParams = z.infer<typeof ExportTippingWalletSchema>;
interface ExportWalletResult {
    success: boolean;
    operation: string;
    data?: {
        userId: string;
        address: string;
        privateKey: string;
        network: string;
        isNewWallet: boolean;
        timestamp: string;
        solanaAddress?: string;
        solanaPrivateKeyBase58?: string;
    };
    security?: {
        warnings: string[];
        importInstructions: {
            metamask: string;
        };
    };
    error?: {
        code: string;
        message: string;
        details?: string;
    };
    message: string;
}
export default class ExportTippingWalletTool extends MCPTool<ExportTippingWalletParams> {
    name: string;
    description: string;
    schema: z.ZodObject<{
        tipMdUserId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        tipMdUserId: string;
    }, {
        tipMdUserId: string;
    }>;
    constructor();
    execute(input: ExportTippingWalletParams, context?: {
        sessionId?: string;
    }): Promise<ExportWalletResult>;
}
export {};
//# sourceMappingURL=ExportTippingWalletTool.d.ts.map