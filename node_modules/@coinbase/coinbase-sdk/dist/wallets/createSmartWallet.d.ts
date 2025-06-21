import { Signer, type SmartWallet } from "./types";
/**
 * Options for creating a smart wallet
 */
export type CreateSmartWalletOptions = {
    /** The signer object that will own the smart wallet */
    signer: Signer;
};
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
export declare function createSmartWallet(options: CreateSmartWalletOptions): Promise<SmartWallet>;
