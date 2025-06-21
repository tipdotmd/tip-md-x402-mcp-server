import { MCPTool } from "mcp-framework";
import { z } from 'zod';
import { ethers } from 'ethers';
declare const CheckTippingBalanceSchema: z.ZodObject<{
    tipMdUserId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    tipMdUserId?: string | undefined;
}, {
    tipMdUserId?: string | undefined;
}>;
type CheckTippingBalanceParams = z.infer<typeof CheckTippingBalanceSchema>;
interface BalanceCheckResult {
    success: boolean;
    operation: string;
    data?: {
        userId: string;
        address: string;
        balance: number;
        network: string;
        isNewWallet: boolean;
        privateKey?: string;
        timestamp: string;
    };
    setup?: {
        instructions: string[];
        warnings: string[];
    };
    error?: {
        code: string;
        message: string;
        details?: string;
    };
    message: string;
}
declare class TippingWalletManager {
    private static walletCache;
    static getWalletDir(): string;
    static getWalletPath(userId: string): string;
    static generateSecureUserId(): string;
    static getPersistentUserId(sessionId?: string): Promise<string>;
    static getOrCreateWallet(sessionId?: string, userId?: string): Promise<{
        wallet: ethers.HDNodeWallet | ethers.Wallet;
        isNewWallet: boolean;
        privateKey?: string;
    }>;
    static updateLastUsed(userId: string): Promise<void>;
    static getWalletData(userId: string): Promise<any>;
    static getUSDCBalance(address: string): Promise<number>;
}
export default class CheckTippingBalanceTool extends MCPTool<CheckTippingBalanceParams> {
    readonly name = "check_tipping_balance";
    readonly description = "Check your dedicated tipping wallet balance and get wallet info. Returns structured JSON with wallet details. Creates new wallet if none exists. Provide your tip.md user ID if you have one, or leave empty for new users.";
    schema: z.ZodObject<{
        tipMdUserId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        tipMdUserId?: string | undefined;
    }, {
        tipMdUserId?: string | undefined;
    }>;
    execute(params: CheckTippingBalanceParams, context?: {
        sessionId?: string;
    }): Promise<BalanceCheckResult>;
}
export { TippingWalletManager };
//# sourceMappingURL=CheckTippingBalanceTool.d.ts.map