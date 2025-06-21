import { MCPTool } from "mcp-framework";
import { z } from "zod";
declare const BlockchainTippingParamsZodSchema: z.ZodObject<{
    username: z.ZodString;
    blockchain: z.ZodEnum<["ethereum", "solana", "base"]>;
    amount: z.ZodEffects<z.ZodString, string, string>;
    token: z.ZodEnum<["ETH", "SOL", "USDC"]>;
}, "strip", z.ZodTypeAny, {
    username: string;
    amount: string;
    blockchain: "base" | "ethereum" | "solana";
    token: "ETH" | "USDC" | "SOL";
}, {
    username: string;
    amount: string;
    blockchain: "base" | "ethereum" | "solana";
    token: "ETH" | "USDC" | "SOL";
}>;
export type BlockchainTippingParams = z.infer<typeof BlockchainTippingParamsZodSchema>;
type EthereumTippingResponse = {
    prompt: string;
    content: {
        blockchain: 'ethereum' | 'base';
        recipientAddress: string;
        token: 'ETH' | 'USDC';
        amount: number;
        platformFeePercentage: number;
        network: string;
    };
};
type SolanaTippingResponse = {
    prompt: string;
    content: {
        blockchain: 'solana';
        token: 'SOL' | 'USDC';
        network: string;
        platformFeePercentage: number;
        amount?: number;
        developerAmount?: number;
        platformFeeAmount?: number;
        transaction?: {
            clusterUrl: string;
            recipientAddress: string;
            platformAddress: string;
            lamports: {
                total: number;
                developer: number;
                platformFee: number;
            };
            instructions: [
                {
                    program: string;
                    programId: string;
                    data: {
                        instruction: number;
                        lamports: number;
                    };
                    keys: [
                        {
                            pubkey: string;
                            isSigner: boolean;
                            isWritable: boolean;
                        },
                        {
                            pubkey: string;
                            isSigner: boolean;
                            isWritable: boolean;
                        }
                    ];
                },
                {
                    program: string;
                    programId: string;
                    data: {
                        instruction: number;
                        lamports: number;
                    };
                    keys: [
                        {
                            pubkey: string;
                            isSigner: boolean;
                            isWritable: boolean;
                        },
                        {
                            pubkey: string;
                            isSigner: boolean;
                            isWritable: boolean;
                        }
                    ];
                }
            ];
            transactionConstructionSnippet: string;
        };
        totalAmount?: number;
        transfers?: Array<{
            recipientType: 'developer' | 'platform';
            targetAddress: string;
            amount: number;
            info: string;
        }>;
    };
};
type TippingErrorResponse = {
    prompt: string;
    content: {
        error: string;
    };
};
type BlockchainTippingResponse = EthereumTippingResponse | SolanaTippingResponse | TippingErrorResponse;
export default class CryptoTippingTool extends MCPTool<BlockchainTippingParams> {
    name: string;
    description: string;
    schema: {
        username: {
            type: z.ZodString;
            description: string;
        };
        blockchain: {
            type: z.ZodEnum<["ethereum", "solana", "base"]>;
            description: string;
        };
        amount: {
            type: z.ZodEffects<z.ZodString, string, string>;
            description: string;
        };
        token: {
            type: z.ZodEnum<["ETH", "SOL", "USDC"]>;
            description: string;
        };
    };
    constructor();
    execute(input: BlockchainTippingParams): Promise<BlockchainTippingResponse>;
    private handleEthereumTipping;
    private handleSolanaTipping;
}
export {};
//# sourceMappingURL=CryptoTippingTool.d.ts.map