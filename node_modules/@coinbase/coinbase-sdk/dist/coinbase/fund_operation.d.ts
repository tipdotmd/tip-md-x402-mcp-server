import { Decimal } from "decimal.js";
import { FundOperation as FundOperationModel } from "../client/api";
import { Asset } from "./asset";
import { FundQuote } from "./fund_quote";
import { FundOperationStatus, PaginationOptions, PaginationResponse } from "./types";
import { CryptoAmount } from "./crypto_amount";
/**
 * A representation of a Fund Operation.
 */
export declare class FundOperation {
    /**
     * Fund Operation status constants.
     */
    static readonly Status: {
        readonly TERMINAL_STATES: Set<string>;
    };
    private model;
    private asset;
    /**
     * Creates a new FundOperation instance.
     *
     * @param model - The model representing the fund operation
     */
    constructor(model: FundOperationModel);
    /**
     * Converts a FundOperationModel into a FundOperation object.
     *
     * @param fundOperationModel - The FundOperation model object.
     * @returns The FundOperation object.
     */
    static fromModel(fundOperationModel: FundOperationModel): FundOperation;
    /**
     * Create a new Fund Operation.
     *
     * @param walletId - The Wallet ID
     * @param addressId - The Address ID
     * @param amount - The amount of the Asset
     * @param assetId - The Asset ID
     * @param networkId - The Network ID
     * @param quote - Optional Fund Quote
     * @returns The new FundOperation object
     */
    static create(walletId: string, addressId: string, amount: Decimal, assetId: string, networkId: string, quote?: FundQuote): Promise<FundOperation>;
    /**
     * List fund operations.
     *
     * @param walletId - The wallet ID
     * @param addressId - The address ID
     * @param options - The pagination options
     * @param options.limit - The maximum number of Fund Operations to return. Limit can range between 1 and 100.
     * @param options.page - The cursor for pagination across multiple pages of Fund Operations. Don't include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     * @returns The paginated list response of fund operations
     */
    static listFundOperations(walletId: string, addressId: string, { limit, page }?: PaginationOptions): Promise<PaginationResponse<FundOperation>>;
    /**
     * Gets the Fund Operation ID.
     *
     * @returns {string} The unique identifier of the fund operation
     */
    getId(): string;
    /**
     * Gets the Network ID.
     *
     * @returns {string} The network identifier
     */
    getNetworkId(): string;
    /**
     * Gets the Wallet ID.
     *
     * @returns {string} The wallet identifier
     */
    getWalletId(): string;
    /**
     * Gets the Address ID.
     *
     * @returns {string} The address identifier
     */
    getAddressId(): string;
    /**
     * Gets the Asset.
     *
     * @returns {Asset} The asset associated with this operation
     */
    getAsset(): Asset;
    /**
     * Gets the amount.
     *
     * @returns {CryptoAmount} The crypto amount
     */
    getAmount(): CryptoAmount;
    /**
     * Gets the fiat amount.
     *
     * @returns {Decimal} The fiat amount in decimal format
     */
    getFiatAmount(): Decimal;
    /**
     * Gets the fiat currency.
     *
     * @returns {string} The fiat currency code
     */
    getFiatCurrency(): string;
    /**
     * Returns the Status of the Transfer.
     *
     * @returns The Status of the Transfer.
     */
    getStatus(): FundOperationStatus;
    /**
     * Reloads the fund operation from the server.
     *
     * @returns {Promise<FundOperation>} A promise that resolves to the updated fund operation
     */
    reload(): Promise<FundOperation>;
    /**
     * Wait for the fund operation to complete.
     *
     * @param options - Options for waiting
     * @param options.intervalSeconds - The interval between checks in seconds
     * @param options.timeoutSeconds - The timeout in seconds
     * @returns The completed fund operation
     * @throws {TimeoutError} If the operation takes too long
     */
    wait({ intervalSeconds, timeoutSeconds }?: {
        intervalSeconds?: number | undefined;
        timeoutSeconds?: number | undefined;
    }): Promise<FundOperation>;
    /**
     * Check if the operation is in a terminal state.
     *
     * @returns {boolean} True if the operation is in a terminal state, false otherwise
     */
    private isTerminalState;
}
