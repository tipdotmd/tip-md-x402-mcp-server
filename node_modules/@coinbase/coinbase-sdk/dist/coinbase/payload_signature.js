"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayloadSignature = void 0;
const types_1 = require("./types");
const utils_1 = require("./utils");
const errors_1 = require("./errors");
const coinbase_1 = require("./coinbase");
/**
 * A representation of a Payload Signature.
 */
class PayloadSignature {
    /**
     * Constructs a Payload Signature.
     *
     * @class
     * @param model - The underlying Payload Signature object.
     */
    constructor(model) {
        if (!model) {
            throw new Error("Invalid model type");
        }
        this.model = model;
    }
    /**
     * Returns the ID of the Payload Signature.
     *
     * @returns The ID of the Payload Signature
     */
    getId() {
        return this.model.payload_signature_id;
    }
    /**
     * Returns the Wallet ID of the Payload Signature.
     *
     * @returns The Wallet ID
     */
    getWalletId() {
        return this.model.wallet_id;
    }
    /**
     * Returns the Address ID of the Payload Signature.
     *
     * @returns The Address ID
     */
    getAddressId() {
        return this.model.address_id;
    }
    /**
     * Returns the Unsigned Payload of the Payload Signature.
     *
     * @returns The Unsigned Payload
     */
    getUnsignedPayload() {
        return this.model.unsigned_payload;
    }
    /**
     * Returns the Signature of the Payload Signature.
     *
     * @returns The Signature
     */
    getSignature() {
        return this.model.signature;
    }
    /**
     * Returns the Status of the Payload Signature.
     *
     * @returns The Status
     */
    getStatus() {
        switch (this.model.status) {
            case types_1.PayloadSignatureStatus.PENDING:
                return types_1.PayloadSignatureStatus.PENDING;
            case types_1.PayloadSignatureStatus.SIGNED:
                return types_1.PayloadSignatureStatus.SIGNED;
            case types_1.PayloadSignatureStatus.FAILED:
                return types_1.PayloadSignatureStatus.FAILED;
            default:
                return undefined;
        }
    }
    /**
     * Returns whether the Payload Signature is in a terminal State.
     *
     * @returns Whether the Payload Signature is in a terminal State
     */
    isTerminalState() {
        const status = this.getStatus();
        if (!status)
            return false;
        return [types_1.PayloadSignatureStatus.SIGNED, types_1.PayloadSignatureStatus.FAILED].includes(status);
    }
    /**
     * Waits for the Payload Signature to be signed or for the signature operation to fail.
     *
     * @param options - The options to configure the wait function.
     * @param options.intervalSeconds - The interval to check the status of the Payload Signature.
     * @param options.timeoutSeconds - The maximum time to wait for the Payload Signature to be confirmed.
     *
     * @returns The Payload Signature object in a terminal state.
     * @throws {Error} if the Payload Signature times out.
     */
    async wait({ intervalSeconds = 0.2, timeoutSeconds = 10, } = {}) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutSeconds * 1000) {
            await this.reload();
            // If the Payload Signature is in a terminal state, return the Payload Signature.
            if (this.isTerminalState()) {
                return this;
            }
            await (0, utils_1.delay)(intervalSeconds);
        }
        throw new errors_1.TimeoutError("Payload Signature timed out");
    }
    /**
     * Reloads the Payload Signature model with the latest data from the server.
     *
     * @throws {APIError} if the API request to get a Payload Signature fails.
     */
    async reload() {
        const result = await coinbase_1.Coinbase.apiClients.address.getPayloadSignature(this.getWalletId(), this.getAddressId(), this.getId());
        this.model = result?.data;
    }
    /**
     * Returns a string representation of the Payload Signature.
     *
     * @returns A string representation of the Payload Signature.
     */
    toString() {
        return `PayloadSignature { status: '${this.getStatus()}', unsignedPayload: '${this.getUnsignedPayload()}', signature: ${this.getSignature()} }`;
    }
}
exports.PayloadSignature = PayloadSignature;
