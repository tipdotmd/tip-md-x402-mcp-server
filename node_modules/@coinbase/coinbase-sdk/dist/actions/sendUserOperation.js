"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendUserOperation = void 0;
const chain_1 = require("../types/chain");
const viem_1 = require("viem");
const coinbase_1 = require("../coinbase/coinbase");
/**
 * Sends a user operation to the network
 *
 * @example
 * ```ts
 * import { sendUserOperation } from "@coinbase/coinbase-sdk";
 * import { parseEther } from "viem";
 *
 * const result = await sendUserOperation(wallet, {
 *   calls: [
 *     {
 *       abi: erc20Abi,
 *       functionName: "transfer",
 *       args: [to, amount],
 *     },
 *     {
 *       to: "0x1234567890123456789012345678901234567890",
 *       data: "0x",
 *       value: parseEther("0.0000005"),
 *     },
 *   ],
 *   chainId: 1,
 *   paymasterUrl: "https://api.developer.coinbase.com/rpc/v1/base/someapikey",
 * });
 * ```
 *
 * @param {SmartWallet} wallet - The smart wallet to send the user operation from
 * @param {SendUserOperationOptions<T>} options - The options for the user operation
 * @returns {Promise<SendUserOperationReturnType>} The result of the user operation
 */
async function sendUserOperation(wallet, options) {
    const { calls, chainId, paymasterUrl } = options;
    const network = chain_1.CHAIN_ID_TO_NETWORK_ID[chainId];
    if (calls.length === 0) {
        throw new Error("Calls array is empty");
    }
    const encodedCalls = calls.map(call => {
        const value = (call.value ?? BigInt(0)).toString();
        if ("abi" in call && call.abi && "functionName" in call) {
            return {
                to: call.to,
                data: (0, viem_1.encodeFunctionData)({
                    abi: call.abi,
                    functionName: call.functionName,
                    args: call.args,
                }),
                value,
            };
        }
        return {
            to: call.to,
            data: call.data ?? "0x",
            value,
        };
    });
    const createOpResponse = await coinbase_1.Coinbase.apiClients.smartWallet.createUserOperation(wallet.address, network, {
        calls: encodedCalls,
        paymaster_url: paymasterUrl,
    });
    const owner = wallet.owners[0];
    const signature = await owner.sign({
        hash: createOpResponse.data.user_op_hash,
    });
    const broadcastResponse = await coinbase_1.Coinbase.apiClients.smartWallet.broadcastUserOperation(wallet.address, createOpResponse.data.user_op_hash, {
        signature,
    });
    return {
        smartWalletAddress: wallet.address,
        status: broadcastResponse.data.status,
        userOpHash: createOpResponse.data.user_op_hash,
    };
}
exports.sendUserOperation = sendUserOperation;
