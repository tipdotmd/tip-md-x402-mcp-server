import { Decimal } from "decimal.js";
import { ethers } from "ethers";
import { Trade as CoinbaseTrade } from "../client/api";
import { Transaction } from "./transaction";
import { TransactionStatus } from "./types";
/**
 * A representation of a Trade, which trades an amount of an Asset to another Asset on a Network.
 * The fee is assumed to be paid in the native Asset of the Network.
 */
export declare class Trade {
    private model;
    private transaction?;
    private approveTransaction?;
    /**
     * Trades should be created through Wallet.trade or Address.trade.
     *
     * @class
     * @param model - The underlying Trade object.
     * @throws {Error} - If the Trade model is empty.
     */
    constructor(model: CoinbaseTrade);
    /**
     * Returns the Trade ID.
     *
     * @returns The Trade ID.
     */
    getId(): string;
    /**
     * Returns the Network ID of the Trade.
     *
     * @returns The Network ID.
     */
    getNetworkId(): string;
    /**
     * Returns the Wallet ID of the Trade.
     *
     * @returns The Wallet ID.
     */
    getWalletId(): string;
    /**
     * Returns the Address ID of the Trade.
     *
     * @returns The Address ID.
     */
    getAddressId(): string;
    /**
     * Returns the From Asset ID of the Trade.
     *
     * @returns The From Asset ID.
     */
    getFromAssetId(): string;
    /**
     * Returns the amount of the from asset for the Trade.
     *
     * @returns The amount of the from asset.
     */
    getFromAmount(): Decimal;
    /**
     * Returns the To Asset ID of the Trade.
     *
     * @returns The To Asset ID.
     */
    getToAssetId(): string;
    /**
     * Returns the amount of the to asset for the Trade.
     *
     * @returns The amount of the to asset.
     */
    getToAmount(): Decimal;
    /**
     * Returns the Trade transaction.
     *
     * @returns The Trade transaction.
     */
    getTransaction(): Transaction;
    /**
     * Returns the approve transaction if it exists.
     *
     * @returns The approve transaction.
     */
    getApproveTransaction(): Transaction | undefined;
    /**
     * Signs the Trade with the provided key.
     * This signs the transfer transaction and will sign the approval transaction if present.
     *
     * @param key - The key to sign the Transfer with
     */
    sign(key: ethers.Wallet): Promise<void>;
    /**
     * Broadcasts the Trade to the Network.
     *
     * @returns The Trade object
     * @throws {APIError} if the API request to broadcast a Trade fails.
     */
    broadcast(): Promise<Trade>;
    /**
     * Returns the status of the Trade.
     *
     * @returns The status.
     */
    getStatus(): TransactionStatus | undefined;
    /**
     * Waits until the Trade is completed or failed by polling the Network at the given interval.
     * Raises an error if the Trade takes longer than the given timeout.
     *
     * @param options - The options to configure the wait function.
     * @param options.intervalSeconds - The interval at which to poll the Network, in seconds
     * @param options.timeoutSeconds - The maximum amount of time to wait for the Trade to complete, in seconds
     * @throws {Error} If the Trade takes longer than the given timeout.
     * @throws {APIError} If the request fails.
     * @returns The completed Trade object.
     */
    wait({ intervalSeconds, timeoutSeconds }?: {
        intervalSeconds?: number | undefined;
        timeoutSeconds?: number | undefined;
    }): Promise<Trade>;
    /**
     * Reloads the Trade model with the latest version from the server side.
     *
     * @returns The most recent version of Trade from the server.
     */
    reload(): Promise<Trade>;
    /**
     * Returns a String representation of the Trade.
     *
     * @returns A String representation of the Trade.
     */
    toString(): string;
    /**
     * Resets the trade model with the specified data from the server.
     *
     * @param model - The Trade model
     * @returns The updated Trade object
     */
    private resetModel;
}
