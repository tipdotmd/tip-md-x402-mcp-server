"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const ethers_1 = require("ethers");
const types_1 = require("./types");
const utils_1 = require("./utils");
/**
 * A representation of an onchain Transaction.
 */
class Transaction {
    /**
     * Transactions should be constructed via higher level abstractions like Trade or Transfer.
     *
     * @class
     * @param model - The underlying Transaction object.
     */
    constructor(model) {
        if (!model) {
            throw new Error("Invalid model type");
        }
        this.model = model;
    }
    /**
     * Returns the Unsigned Payload of the Transaction.
     *
     * @returns The Unsigned Payload
     */
    getUnsignedPayload() {
        return this.model.unsigned_payload;
    }
    /**
     * Returns the Signed Payload of the Transaction.
     *
     * @returns The Signed Payload
     */
    getSignedPayload() {
        return this.model.signed_payload;
    }
    /**
     * Returns the Transaction Hash of the Transaction.
     *
     * @returns The Transaction Hash
     */
    getTransactionHash() {
        return this.model.transaction_hash;
    }
    /**
     * Returns the Status of the Transaction.
     *
     * @returns The Status
     */
    getStatus() {
        switch (this.model.status) {
            case types_1.TransactionStatus.PENDING:
                return types_1.TransactionStatus.PENDING;
            case types_1.TransactionStatus.BROADCAST:
                return types_1.TransactionStatus.BROADCAST;
            case types_1.TransactionStatus.SIGNED:
                return types_1.TransactionStatus.SIGNED;
            case types_1.TransactionStatus.COMPLETE:
                return types_1.TransactionStatus.COMPLETE;
            case types_1.TransactionStatus.FAILED:
                return types_1.TransactionStatus.FAILED;
            default:
                return types_1.TransactionStatus.UNSPECIFIED;
        }
    }
    /**
     * Returns whether the Transaction is in a terminal State.
     *
     * @returns Whether the Transaction is in a terminal State
     */
    isTerminalState() {
        const status = this.getStatus();
        return [types_1.TransactionStatus.COMPLETE, types_1.TransactionStatus.FAILED].includes(status);
    }
    /**
     * Returns the From Address ID for the Transaction.
     *
     * @returns The From Address ID
     */
    fromAddressId() {
        return this.model.from_address_id;
    }
    /**
     * Returns the To Address ID for the Transaction if it's available.
     *
     * @returns The To Address ID
     */
    toAddressId() {
        return this.model.to_address_id;
    }
    /**
     * Returns the Block Height where the Transaction is recorded.
     *
     * @returns The Block Height
     */
    blockHeight() {
        return this.model.block_height;
    }
    /**
     * Returns the Block Hash where the Transaction is recorded.
     *
     * @returns The Block Hash
     */
    blockHash() {
        return this.model.block_hash;
    }
    /**
     * Returns the Content of the Transaction.
     *
     * @returns The transaction content
     */
    content() {
        return this.model.content;
    }
    /**
     * Returns the link to the Transaction on the blockchain explorer.
     *
     * @returns The link to the Transaction on the blockchain explorer
     */
    getTransactionLink() {
        return this.model.transaction_link;
    }
    /**
     * Returns the Network ID of the Transaction.
     *
     * @returns The Network ID.
     */
    getNetworkId() {
        return this.model.network_id;
    }
    /**
     * Returns the underlying raw transaction.
     *
     * @throws {InvalidUnsignedPayload} If the Unsigned Payload is invalid.
     * @returns The ethers.js Transaction object
     */
    rawTransaction() {
        if (this.raw) {
            return this.raw;
        }
        const parsedPayload = (0, utils_1.parseUnsignedPayload)(this.getUnsignedPayload());
        const transaction = new ethers_1.ethers.Transaction();
        transaction.chainId = BigInt(parsedPayload.chainId);
        transaction.nonce = BigInt(parsedPayload.nonce);
        transaction.maxPriorityFeePerGas = BigInt(parsedPayload.maxPriorityFeePerGas);
        transaction.maxFeePerGas = BigInt(parsedPayload.maxFeePerGas);
        // TODO: Handle multiple currencies.
        transaction.gasLimit = BigInt(parsedPayload.gas);
        transaction.to = parsedPayload.to;
        transaction.value = BigInt(parsedPayload.value);
        transaction.data = parsedPayload.input;
        this.raw = transaction;
        return this.raw;
    }
    /**
     * Signs the Transaction with the provided key and returns the hex signing payload.
     *
     * @param key - The key to sign the transaction with
     * @returns The hex-encoded signed payload
     */
    async sign(key) {
        const signedPayload = await key.signTransaction(this.rawTransaction());
        this.model.signed_payload = signedPayload;
        // Removes the '0x' prefix as required by the API.
        return signedPayload.slice(2);
    }
    /**
     * Returns the Signed Payload of the Transaction.
     *
     * @returns The Signed Payload
     */
    getSignature() {
        return this.getSignedPayload()?.slice(2);
    }
    /**
     * Returns whether the transaction has been signed.
     *
     * @returns if the transaction has been signed.
     */
    isSigned() {
        return !!this.getSignature();
    }
    /**
     * Returns a string representation of the Transaction.
     *
     * @returns A string representation of the Transaction.
     */
    toString() {
        return `Transaction { transactionHash: '${this.getTransactionHash()}', status: '${this.getStatus()}', unsignedPayload: '${this.getUnsignedPayload()}', signedPayload: ${this.getSignedPayload()}, transactionLink: ${this.getTransactionLink()} }`;
    }
}
exports.Transaction = Transaction;
