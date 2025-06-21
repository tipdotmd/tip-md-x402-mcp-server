import { FaucetTransaction as FaucetTransactionModel } from "../client";
import { TransactionStatus } from "./types";
import { Transaction } from "./transaction";
/**
 * Represents a transaction from a faucet.
 */
export declare class FaucetTransaction {
    private model;
    private _transaction;
    /**
     * Creates a new FaucetTransaction instance.
     * Do not use this method directly - instead, use Address.faucet().
     *
     * @class
     * @param {FaucetTransactionModel} model - The FaucetTransaction model.
     * @throws {Error} If the model does not exist.
     */
    constructor(model: FaucetTransactionModel);
    /**
     * Returns the Transaction of the FaucetTransaction.
     *
     * @returns The Faucet Transaction
     */
    get transaction(): Transaction;
    /**
     * Returns the transaction hash.
     *
     * @returns {string} The transaction hash.
     */
    getTransactionHash(): string;
    /**
     * Returns the link to the transaction on the blockchain explorer.
     *
     * @returns {string} The link to the transaction on the blockchain explorer
     */
    getTransactionLink(): string;
    /**
     * Returns the Status of the FaucetTransaction.
     *
     * @returns The Status of the FaucetTransaction.
     */
    getStatus(): TransactionStatus;
    /**
     * Returns the network ID of the FaucetTransaction.
     *
     * @returns {string} The network ID.
     */
    getNetworkId(): string;
    /**
     * Returns the address that is being funded by the faucet.
     *
     * @returns {string} The address ID.
     */
    getAddressId(): string;
    /**
     * Waits for the FaucetTransaction to be confirmed on the Network or fail on chain.
     * Waits until the FaucetTransaction is completed or failed on-chain by polling at the given interval.
     * Raises an error if the FaucetTransaction takes longer than the given timeout.
     *
     * @param options - The options to configure the wait function.
     * @param options.intervalSeconds - The interval to check the status of the FaucetTransaction.
     * @param options.timeoutSeconds - The maximum time to wait for the FaucetTransaction to be confirmed.
     *
     * @returns The FaucetTransaction object in a terminal state.
     * @throws {Error} if the FaucetTransaction times out.
     */
    wait({ intervalSeconds, timeoutSeconds, }?: {
        intervalSeconds?: number | undefined;
        timeoutSeconds?: number | undefined;
    }): Promise<FaucetTransaction>;
    /**
     * Reloads the FaucetTransaction model with the latest data from the server.
     *
     * @returns {FaucetTransaction} The reloaded FaucetTransaction object.
     * @throws {APIError} if the API request to get a FaucetTransaction fails.
     */
    reload(): Promise<FaucetTransaction>;
    /**
     * Returns a string representation of the FaucetTransaction.
     *
     * @returns {string} A string representation of the FaucetTransaction.
     */
    toString(): string;
}
