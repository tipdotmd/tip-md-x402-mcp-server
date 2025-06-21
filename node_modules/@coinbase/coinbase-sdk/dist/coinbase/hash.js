"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashTypedDataMessage = exports.hashMessage = void 0;
const ethers_1 = require("ethers");
/**
 * Computes the EIP-191 personal-sign message digest to sign.
 *
 * @returns The EIP-191 hash of the message as a string.
 * @throws {Error} if the message cannot be hashed.
 * @param message - The message to hash.
 */
const hashMessage = (message) => {
    return ethers_1.ethers.hashMessage(message);
};
exports.hashMessage = hashMessage;
/**
 * Computes the hash of the EIP-712 compliant typed data message.
 *
 * @param domain - The domain parameters for the EIP-712 message, including the name, version, chainId, and verifying contract.
 * @param types - The types definitions for the EIP-712 message, represented as a record of type names to their fields.
 * @param value - The actual data object to hash, conforming to the types defined.
 *
 * @returns The EIP-712 hash of the typed data as a hex-encoded string.
 * @throws {Error} if the typed data cannot be hashed.
 */
const hashTypedDataMessage = (domain, types, 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
value) => {
    return ethers_1.ethers.TypedDataEncoder.hash(domain, types, value);
};
exports.hashTypedDataMessage = hashTypedDataMessage;
