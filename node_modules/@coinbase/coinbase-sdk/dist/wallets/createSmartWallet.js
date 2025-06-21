"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSmartWallet = void 0;
const index_1 = require("../index");
const toSmartWallet_1 = require("./toSmartWallet");
/**
 * @description Creates a new smart wallet using the Coinbase API
 *
 * @param - {@link CreateSmartWalletOptions} options - Configuration options for creating the smart wallet
 * @returns {Promise<SmartWallet>} A promise that resolves to the newly created smart wallet instance
 * @throws {Error} If the Coinbase API client is not initialized
 *
 * See https://viem.sh/docs/accounts/local/privateKeyToAccount for using a Viem LocalAccount with SmartWallet
 *
 * @example
 * ```ts
 * import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
 * import { createSmartWallet } from "@coinbase/coinbase-sdk";
 * import { Coinbase } from "@coinbase/coinbase-sdk";
 *
 * Coinbase.configureFromJson({filePath: "~/.apikeys/prod.json"});
 *
 * const privateKey = generatePrivateKey();
 * const owner = privateKeyToAccount(privateKey);
 * const wallet = await createSmartWallet({
 *   signer: owner
 * });
 * ```
 *
 */
async function createSmartWallet(options) {
    const result = await index_1.Coinbase.apiClients.smartWallet.createSmartWallet({
        owner: options.signer.address,
    });
    return (0, toSmartWallet_1.toSmartWallet)({
        smartWalletAddress: result.data.address,
        signer: options.signer,
    });
}
exports.createSmartWallet = createSmartWallet;
