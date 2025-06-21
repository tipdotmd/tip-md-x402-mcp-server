"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SponsoredSend = void 0;
const ethers_1 = require("ethers");
const types_1 = require("./types");
/**
 * A representation of an onchain Sponsored Send.
 */
class SponsoredSend {
    /**
     * Sponsored Sends should be constructed via higher level abstractions like Transfer.
     *
     * @class
     * @param model - The underlying Sponsored Send object.
     */
    constructor(model) {
        if (!model) {
            throw new Error("Invalid model type");
        }
        this.model = model;
    }
    /**
     * Returns the Keccak256 hash of the typed data. This payload must be signed
     * by the sender to be used as an approval in the EIP-3009 transaction.
     *
     * @returns The Keccak256 hash of the typed data.
     */
    getTypedDataHash() {
        return this.model.typed_data_hash;
    }
    /**
     * Returns the signature of the typed data.
     *
     * @returns The hash of the typed data signature.
     */
    getSignature() {
        return this.model.signature;
    }
    /**
     * Signs the Sponsored Send with the provided key and returns the hex signature.
     *
     * @param key - The key to sign the Sponsored Send with
     * @returns The hex-encoded signature
     */
    async sign(key) {
        ethers_1.ethers.toBeArray;
        const signature = key.signingKey.sign(ethers_1.ethers.getBytes(this.getTypedDataHash())).serialized;
        this.model.signature = signature;
        return signature;
    }
    /**
     * Returns whether the Sponsored Send has been signed.
     *
     * @returns if the Sponsored Send has been signed.
     */
    isSigned() {
        return !!this.getSignature();
    }
    /**
     * Returns the Status of the Sponsored Send.
     *
     * @returns the Status of the Sponsored Send
     */
    getStatus() {
        switch (this.model.status) {
            case types_1.SponsoredSendStatus.PENDING:
                return types_1.SponsoredSendStatus.PENDING;
            case types_1.SponsoredSendStatus.SIGNED:
                return types_1.SponsoredSendStatus.SIGNED;
            case types_1.SponsoredSendStatus.SUBMITTED:
                return types_1.SponsoredSendStatus.SUBMITTED;
            case types_1.SponsoredSendStatus.COMPLETE:
                return types_1.SponsoredSendStatus.COMPLETE;
            case types_1.SponsoredSendStatus.FAILED:
                return types_1.SponsoredSendStatus.FAILED;
            default:
                undefined;
        }
    }
    /**
     * Returns whether the Sponsored Send is in a terminal State.
     *
     * @returns Whether the Sponsored Send is in a terminal State
     */
    isTerminalState() {
        const status = this.getStatus();
        if (!status)
            return false;
        return [types_1.SponsoredSendStatus.COMPLETE, types_1.SponsoredSendStatus.FAILED].includes(status);
    }
    /**
     * Returns the Transaction Hash of the Sponsored Send.
     *
     * @returns The Transaction Hash
     */
    getTransactionHash() {
        return this.model.transaction_hash;
    }
    /**
     * Returns the link to the Sponsored Send on the blockchain explorer.
     *
     * @returns The link to the Sponsored Send on the blockchain explorer
     */
    getTransactionLink() {
        return this.model.transaction_link;
    }
    /**
     * Returns a string representation of the Sponsored Send.
     *
     * @returns A string representation of the Sponsored Send
     */
    toString() {
        return `SponsoredSend { transactionHash: '${this.getTransactionHash()}', status: '${this.getStatus()}', typedDataHash: '${this.getTypedDataHash()}', signature: ${this.getSignature()}, transactionLink: ${this.getTransactionLink()} }`;
    }
}
exports.SponsoredSend = SponsoredSend;
