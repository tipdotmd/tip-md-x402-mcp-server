import { Decimal } from "decimal.js";
import { FundQuote as FundQuoteModel } from "../client/api";
import { Asset } from "./asset";
import { CryptoAmount } from "./crypto_amount";
import { FundOperation } from "./fund_operation";
/**
 * A representation of a Fund Operation Quote.
 */
export declare class FundQuote {
    private model;
    private asset;
    /**
     * Creates a new FundQuote instance.
     *
     * @param model - The model representing the fund quote
     */
    constructor(model: FundQuoteModel);
    /**
     * Converts a FundQuoteModel into a FundQuote object.
     *
     * @param fundQuoteModel - The FundQuote model object.
     * @returns The FundQuote object.
     */
    static fromModel(fundQuoteModel: FundQuoteModel): FundQuote;
    /**
     * Create a new Fund Operation Quote.
     *
     * @param walletId - The Wallet ID
     * @param addressId - The Address ID
     * @param amount - The amount of the Asset
     * @param assetId - The Asset ID
     * @param networkId - The Network ID
     * @returns The new FundQuote object
     */
    static create(walletId: string, addressId: string, amount: Decimal, assetId: string, networkId: string): Promise<FundQuote>;
    /**
     * Gets the Fund Quote ID.
     *
     * @returns {string} The unique identifier of the fund quote
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
     * @returns {Asset} The asset associated with this quote
     */
    getAsset(): Asset;
    /**
     * Gets the crypto amount.
     *
     * @returns {CryptoAmount} The cryptocurrency amount
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
     * Gets the buy fee.
     *
     * @returns {{ amount: string; currency: string }} The buy fee amount and currency
     */
    getBuyFee(): {
        amount: string;
        currency: string;
    };
    /**
     * Gets the transfer fee.
     *
     * @returns {CryptoAmount} The transfer fee as a crypto amount
     */
    getTransferFee(): CryptoAmount;
    /**
     * Execute the fund quote to create a fund operation.
     *
     * @returns {Promise<FundOperation>} A promise that resolves to the created fund operation
     */
    execute(): Promise<FundOperation>;
}
