"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSmartWallet = void 0;
const sendUserOperation_1 = require("../actions/sendUserOperation");
const chain_1 = require("../utils/chain");
/**
 * Creates a SmartWallet instance from an existing smart wallet address and signer.
 * Use this to interact with previously deployed smart wallets, rather than creating new ones.
 *
 * The signer must be the original owner of the smart wallet.
 *
 * @example
 * ```typescript
 * import { toSmartWallet } from "@coinbase/coinbase-sdk";
 *
 * // Connect to an existing smart wallet
 * const wallet = toSmartWallet({
 *   smartWalletAddress: "0x1234567890123456789012345678901234567890",
 *   signer: localAccount
 * });
 *
 * // Use on a specific network
 * const networkWallet = wallet.useNetwork({
 *   chainId: 8453, // Base Mainnet
 *   paymasterUrl: "https://paymaster.example.com"
 * });
 * ```
 *
 * @param {ToSmartWalletOptions} options - Configuration options
 * @param {string} options.smartWalletAddress - The deployed smart wallet's address
 * @param {Signer} options.signer - The owner's signer instance
 * @returns {SmartWallet} A configured SmartWallet instance ready for transaction submission
 * @throws {Error} If the signer is not an original owner of the wallet
 */
function toSmartWallet(options) {
    const wallet = {
        address: options.smartWalletAddress,
        owners: [options.signer],
        type: "smart",
        sendUserOperation: options => (0, sendUserOperation_1.sendUserOperation)(wallet, options),
        useNetwork: (options) => {
            const network = (0, chain_1.createNetwork)(options.chainId);
            return {
                ...wallet,
                network,
                paymasterUrl: options.paymasterUrl,
                sendUserOperation: options => (0, sendUserOperation_1.sendUserOperation)(wallet, {
                    ...options,
                    chainId: network.chainId,
                }),
            };
        },
    };
    return wallet;
}
exports.toSmartWallet = toSmartWallet;
