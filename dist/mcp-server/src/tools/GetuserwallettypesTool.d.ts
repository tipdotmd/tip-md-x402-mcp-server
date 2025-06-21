import { MCPTool } from "mcp-framework";
import { z } from "zod";
declare const UserWalletTypesParamsZodSchema: z.ZodObject<{
    username: z.ZodString;
}, "strip", z.ZodTypeAny, {
    username: string;
}, {
    username: string;
}>;
export type GetUserWalletTypesParams = z.infer<typeof UserWalletTypesParamsZodSchema>;
export type UserWalletTypesResponse = string[] | {
    userNotFound: true;
    username: string;
    suggestSignup: true;
    signupUrl: string;
} | {
    noWalletsConfigured: true;
    username: string;
    suggestSetup: true;
    dashboardUrl: string;
};
export default class GetuserwallettypesTool extends MCPTool<GetUserWalletTypesParams> {
    name: string;
    description: string;
    schema: {
        username: {
            type: z.ZodString;
            description: string;
        };
    };
    constructor();
    execute(input: GetUserWalletTypesParams): Promise<UserWalletTypesResponse>;
}
export {};
//# sourceMappingURL=GetuserwallettypesTool.d.ts.map