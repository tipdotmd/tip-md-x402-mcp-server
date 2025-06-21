import type { SmartWallet } from "../wallets/types";
import { UserOperationStatusEnum } from "../client";
import { type SupportedChainId } from "../types/chain";
import type { Address, Hex } from "../types/misc";
import type { Calls } from "../types/calls";
/**
 * Options for sending a user operation
 * @template T - Array type for the calls parameter
 */
export type SendUserOperationOptions<T extends readonly unknown[]> = {
    /**
     * Array of contract calls to execute in the user operation.
     * Each call can either be:
     * - A direct call with `to`, `value`, and `data`
     * - A contract call with `to`, `abi`, `functionName`, and `args`
     *
     * @example
     * ```ts
     * const calls = [
     *   {
     *     to: "0x1234567890123456789012345678901234567890",
     *     value: parseEther("0.0000005"),
     *     data: "0x",
     *   },
     *   {
     *     to: "0x1234567890123456789012345678901234567890",
     *     abi: erc20Abi,
     *     functionName: "transfer",
     *     args: [to, amount],
     *   },
     * ]
     * ```
     */
    calls: Calls<T>;
    /** Chain ID of the network to execute on */
    chainId: SupportedChainId;
    /** Optional URL of the paymaster service to use for gas sponsorship. Must be ERC-7677 compliant. */
    paymasterUrl?: string;
};
/**
 * Return type for the sendUserOperation function
 */
export type SendUserOperationReturnType = {
    /** The address of the smart wallet */
    smartWalletAddress: Address;
    /** The status of the user operation */
    status: typeof UserOperationStatusEnum.Broadcast;
    /** The hash of the user operation. This is not the transaction hash which is only available after the operation is completed.*/
    userOpHash: Hex;
};
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
export declare function sendUserOperation<T extends readonly unknown[]>(wallet: SmartWallet, options: SendUserOperationOptions<T>): Promise<SendUserOperationReturnType>;
