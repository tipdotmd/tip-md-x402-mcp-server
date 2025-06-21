import type { Abi } from "abitype";
import { ContractFunctionName } from "viem";
import { ContractFunctionReturnType } from "./types/contract";
/**
 * Reads data from a smart contract using the Coinbase API.
 *
 * @template TAbi - The ABI type.
 * @template TFunctionName - The contract function name type.
 * @template TArgs - The function arguments type.
 * @param {object} params - The parameters for reading the contract.
 * @param {string} params.networkId - The network ID.
 * @param {string} params.contractAddress - The contract address (as a hexadecimal string).
 * @param {TFunctionName} params.method - The contract method to call.
 * @param {TArgs} params.args - The arguments for the contract method.
 * @param {TAbi} [params.abi] - The contract ABI (optional).
 * @returns {Promise<any>} The result of the contract call.
 */
export declare function readContract<TAbi extends Abi | undefined, TFunctionName extends TAbi extends Abi ? ContractFunctionName<TAbi, "view" | "pure"> : string, TArgs extends Record<string, any>>(params: {
    networkId: string;
    contractAddress: `0x${string}`;
    method: TFunctionName;
    args: TArgs;
    abi?: TAbi;
}): Promise<TAbi extends Abi ? ContractFunctionReturnType<TAbi, Extract<TFunctionName, ContractFunctionName<TAbi, "view" | "pure">>, TArgs> : any>;
