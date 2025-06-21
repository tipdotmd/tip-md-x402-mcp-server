"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FundQuote = void 0;
const decimal_js_1 = require("decimal.js");
const asset_1 = require("./asset");
const crypto_amount_1 = require("./crypto_amount");
const coinbase_1 = require("./coinbase");
const fund_operation_1 = require("./fund_operation");
/**
 * A representation of a Fund Operation Quote.
 */
class FundQuote {
    /**
     * Creates a new FundQuote instance.
     *
     * @param model - The model representing the fund quote
     */
    constructor(model) {
        this.asset = null;
        this.model = model;
    }
    /**
     * Converts a FundQuoteModel into a FundQuote object.
     *
     * @param fundQuoteModel - The FundQuote model object.
     * @returns The FundQuote object.
     */
    static fromModel(fundQuoteModel) {
        return new FundQuote(fundQuoteModel);
    }
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
    static async create(walletId, addressId, amount, assetId, networkId) {
        const asset = await asset_1.Asset.fetch(networkId, assetId);
        const response = await coinbase_1.Coinbase.apiClients.fund.createFundQuote(walletId, addressId, {
            asset_id: asset_1.Asset.primaryDenomination(assetId),
            amount: asset.toAtomicAmount(amount).toString(),
        });
        return FundQuote.fromModel(response.data);
    }
    /**
     * Gets the Fund Quote ID.
     *
     * @returns {string} The unique identifier of the fund quote
     */
    getId() {
        return this.model.fund_quote_id;
    }
    /**
     * Gets the Network ID.
     *
     * @returns {string} The network identifier
     */
    getNetworkId() {
        return this.model.network_id;
    }
    /**
     * Gets the Wallet ID.
     *
     * @returns {string} The wallet identifier
     */
    getWalletId() {
        return this.model.wallet_id;
    }
    /**
     * Gets the Address ID.
     *
     * @returns {string} The address identifier
     */
    getAddressId() {
        return this.model.address_id;
    }
    /**
     * Gets the Asset.
     *
     * @returns {Asset} The asset associated with this quote
     */
    getAsset() {
        if (!this.asset) {
            this.asset = asset_1.Asset.fromModel(this.model.crypto_amount.asset);
        }
        return this.asset;
    }
    /**
     * Gets the crypto amount.
     *
     * @returns {CryptoAmount} The cryptocurrency amount
     */
    getAmount() {
        return crypto_amount_1.CryptoAmount.fromModel(this.model.crypto_amount);
    }
    /**
     * Gets the fiat amount.
     *
     * @returns {Decimal} The fiat amount in decimal format
     */
    getFiatAmount() {
        return new decimal_js_1.Decimal(this.model.fiat_amount.amount);
    }
    /**
     * Gets the fiat currency.
     *
     * @returns {string} The fiat currency code
     */
    getFiatCurrency() {
        return this.model.fiat_amount.currency;
    }
    /**
     * Gets the buy fee.
     *
     * @returns {{ amount: string; currency: string }} The buy fee amount and currency
     */
    getBuyFee() {
        return {
            amount: this.model.fees.buy_fee.amount,
            currency: this.model.fees.buy_fee.currency,
        };
    }
    /**
     * Gets the transfer fee.
     *
     * @returns {CryptoAmount} The transfer fee as a crypto amount
     */
    getTransferFee() {
        return crypto_amount_1.CryptoAmount.fromModel(this.model.fees.transfer_fee);
    }
    /**
     * Execute the fund quote to create a fund operation.
     *
     * @returns {Promise<FundOperation>} A promise that resolves to the created fund operation
     */
    async execute() {
        return fund_operation_1.FundOperation.create(this.getWalletId(), this.getAddressId(), this.getAmount().getAmount(), this.getAsset().getAssetId(), this.getNetworkId(), this);
    }
}
exports.FundQuote = FundQuote;
