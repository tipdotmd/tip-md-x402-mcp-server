"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForUserOperation = void 0;
const coinbase_1 = require("../coinbase/coinbase");
const wait_1 = require("../utils/wait");
const client_1 = require("../client");
/**
 * Waits for a user operation to complete or fail
 *
 * @example
 * ```ts
 * import { waitForUserOperation } from "@coinbase/coinbase-sdk";
 *
 * const result = await waitForUserOperation({
 *   id: "123",
 *   smartWalletAddress: "0x1234567890123456789012345678901234567890",
 *   waitOptions: {
 *     timeoutSeconds: 30,
 *   },
 * });
 * ```
 *
 * @param {WaitForUserOperationOptions} options - The options for the wait operation
 * @returns {Promise<WaitForUserOperationReturnType>} The result of the user operation
 */
async function waitForUserOperation(options) {
    const { userOpHash, smartWalletAddress } = options;
    const reload = async () => {
        const response = await coinbase_1.Coinbase.apiClients.smartWallet.getUserOperation(smartWalletAddress, userOpHash);
        return response.data;
    };
    const transform = (operation) => {
        if (operation.status === client_1.UserOperationStatusEnum.Failed) {
            return {
                smartWalletAddress: smartWalletAddress,
                status: client_1.UserOperationStatusEnum.Failed,
                userOpHash: operation.user_op_hash,
            };
        }
        else if (operation.status === client_1.UserOperationStatusEnum.Complete) {
            return {
                smartWalletAddress: smartWalletAddress,
                transactionHash: operation.transaction_hash,
                status: client_1.UserOperationStatusEnum.Complete,
                userOpHash: operation.user_op_hash,
            };
        }
        else {
            throw new Error("User operation is not terminal");
        }
    };
    const waitOptions = options.waitOptions || {
        timeoutSeconds: 30,
    };
    return await (0, wait_1.wait)(reload, isTerminal, transform, waitOptions);
}
exports.waitForUserOperation = waitForUserOperation;
const isTerminal = (operation) => {
    return (operation.status === client_1.UserOperationStatusEnum.Complete ||
        operation.status === client_1.UserOperationStatusEnum.Failed);
};
