import { ethers } from "ethers";
import { Transaction as TransactionModel, EthereumTransaction } from "../client/api";
import { TransactionStatus } from "./types";
/**
 * A representation of an onchain Transaction.
 */
export declare class Transaction {
    private model;
    private raw?;
    /**
     * Transactions should be constructed via higher level abstractions like Trade or Transfer.
     *
     * @class
     * @param model - The underlying Transaction object.
     */
    constructor(model: TransactionModel);
    /**
     * Returns the Unsigned Payload of the Transaction.
     *
     * @returns The Unsigned Payload
     */
    getUnsignedPayload(): string;
    /**
     * Returns the Signed Payload of the Transaction.
     *
     * @returns The Signed Payload
     */
    getSignedPayload(): string | undefined;
    /**
     * Returns the Transaction Hash of the Transaction.
     *
     * @returns The Transaction Hash
     */
    getTransactionHash(): string | undefined;
    /**
     * Returns the Status of the Transaction.
     *
     * @returns The Status
     */
    getStatus(): TransactionStatus;
    /**
     * Returns whether the Transaction is in a terminal State.
     *
     * @returns Whether the Transaction is in a terminal State
     */
    isTerminalState(): boolean;
    /**
     * Returns the From Address ID for the Transaction.
     *
     * @returns The From Address ID
     */
    fromAddressId(): string;
    /**
     * Returns the To Address ID for the Transaction if it's available.
     *
     * @returns The To Address ID
     */
    toAddressId(): string | undefined;
    /**
     * Returns the Block Height where the Transaction is recorded.
     *
     * @returns The Block Height
     */
    blockHeight(): string | undefined;
    /**
     * Returns the Block Hash where the Transaction is recorded.
     *
     * @returns The Block Hash
     */
    blockHash(): string | undefined;
    /**
     * Returns the Content of the Transaction.
     *
     * @returns The transaction content
     */
    content(): EthereumTransaction | undefined;
    /**
     * Returns the link to the Transaction on the blockchain explorer.
     *
     * @returns The link to the Transaction on the blockchain explorer
     */
    getTransactionLink(): string;
    /**
     * Returns the Network ID of the Transaction.
     *
     * @returns The Network ID.
     */
    getNetworkId(): string;
    /**
     * Returns the underlying raw transaction.
     *
     * @throws {InvalidUnsignedPayload} If the Unsigned Payload is invalid.
     * @returns The ethers.js Transaction object
     */
    rawTransaction(): ethers.Transaction;
    /**
     * Signs the Transaction with the provided key and returns the hex signing payload.
     *
     * @param key - The key to sign the transaction with
     * @returns The hex-encoded signed payload
     */
    sign(key: ethers.Wallet): Promise<string>;
    /**
     * Returns the Signed Payload of the Transaction.
     *
     * @returns The Signed Payload
     */
    getSignature(): string | undefined;
    /**
     * Returns whether the transaction has been signed.
     *
     * @returns if the transaction has been signed.
     */
    isSigned(): boolean;
    /**
     * Returns a string representation of the Transaction.
     *
     * @returns A string representation of the Transaction.
     */
    toString(): string;
}
