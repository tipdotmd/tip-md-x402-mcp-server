import { Decimal } from "decimal.js";
import { TransferStatus } from "./types";
import { Transaction } from "./transaction";
import { SponsoredSend } from "./sponsored_send";
import { Transfer as TransferModel } from "../client/api";
import { ethers } from "ethers";
/**
 * A representation of a Transfer, which moves an Amount of an Asset from
 * a user-controlled Wallet to another Address. The fee is assumed to be paid
 * in the native Asset of the Network.
 */
export declare class Transfer {
    private model;
    /**
     * Private constructor to prevent direct instantiation outside of the factory methods.
     *
     * @ignore
     * @param transferModel - The Transfer model.
     * @hideconstructor
     */
    private constructor();
    /**
     * Converts a TransferModel into a Transfer object.
     *
     * @param transferModel - The Transfer model object.
     * @returns The Transfer object.
     */
    static fromModel(transferModel: TransferModel): Transfer;
    /**
     * Returns the ID of the Transfer.
     *
     * @returns The Transfer ID.
     */
    getId(): string;
    /**
     * Returns the Network ID of the Transfer.
     *
     * @returns The Network ID.
     */
    getNetworkId(): string;
    /**
     * Returns the Wallet ID of the Transfer.
     *
     * @returns The Wallet ID.
     */
    getWalletId(): string;
    /**
     * Returns the From Address ID of the Transfer.
     *
     * @returns The From Address ID.
     */
    getFromAddressId(): string;
    /**
     * Returns the Destination Address ID of the Transfer.
     *
     * @returns The Destination Address ID.
     */
    getDestinationAddressId(): string;
    /**
     * Returns the Asset ID of the Transfer.
     *
     * @returns The Asset ID.
     */
    getAssetId(): string;
    /**
     * Returns the Amount of the Transfer.
     *
     * @returns The Amount of the Asset.
     */
    getAmount(): Decimal;
    /**
     * Returns the Transaction Hash of the Transfer.
     *
     * @returns The Transaction Hash as a Hex string, or undefined if not yet available.
     */
    getTransactionHash(): string | undefined;
    /**
     * Returns the Transaction of the Transfer.
     *
     * @returns The ethers.js Transaction object.
     * @throws (InvalidUnsignedPayload) If the Unsigned Payload is invalid.
     */
    getRawTransaction(): ethers.Transaction | undefined;
    /**
     * Signs the Transfer with the provided key and returns the hex signature
     * required for broadcasting the Transfer.
     *
     * @param key - The key to sign the Transfer with
     * @returns The hex-encoded signed payload
     */
    sign(key: ethers.Wallet): Promise<string>;
    /**
     * Returns the Status of the Transfer.
     *
     * @returns The Status of the Transfer.
     */
    getStatus(): TransferStatus | undefined;
    /**
     * Returns the Transaction of the Transfer.
     *
     * @returns The Transaction
     */
    getTransaction(): Transaction | undefined;
    /**
     * Returns the Sponsored Send of the Transfer.
     *
     * @returns The Sponsored Send
     */
    getSponsoredSend(): SponsoredSend | undefined;
    /**
     * Returns the Send Transaction Delegate of the Transfer.
     *
     * @returns Either the Transaction or the Sponsored Send
     */
    getSendTransactionDelegate(): Transaction | SponsoredSend | undefined;
    /**
     * Returns the link to the Transaction on the blockchain explorer.
     *
     * @returns The link to the Transaction on the blockchain explorer.
     */
    getTransactionLink(): string | undefined;
    /**
     * Broadcasts the Transfer to the Network.
     *
     * @returns The Transfer object
     * @throws {APIError} if the API request to broadcast a Transfer fails.
     */
    broadcast(): Promise<Transfer>;
    /**
     * Waits for the Transfer to be confirmed on the Network or fail on chain.
     * Waits until the Transfer is completed or failed on-chain by polling at the given interval.
     * Raises an error if the Trade takes longer than the given timeout.
     *
     * @param options - The options to configure the wait function.
     * @param options.intervalSeconds - The interval to check the status of the Transfer.
     * @param options.timeoutSeconds - The maximum time to wait for the Transfer to be confirmed.
     *
     * @returns The Transfer object in a terminal state.
     * @throws {Error} if the Transfer times out.
     */
    wait({ intervalSeconds, timeoutSeconds }?: {
        intervalSeconds?: number | undefined;
        timeoutSeconds?: number | undefined;
    }): Promise<Transfer>;
    /**
     * Reloads the Transfer model with the latest data from the server.
     *
     * @throws {APIError} if the API request to get a Transfer fails.
     */
    reload(): Promise<void>;
    /**
     * Returns a string representation of the Transfer.
     *
     * @returns The string representation of the Transfer.
     */
    toString(): string;
}
