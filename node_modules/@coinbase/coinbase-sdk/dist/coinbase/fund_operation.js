"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FundOperation = void 0;
const decimal_js_1 = require("decimal.js");
const asset_1 = require("./asset");
const coinbase_1 = require("./coinbase");
const utils_1 = require("./utils");
const errors_1 = require("./errors");
const types_1 = require("./types");
const crypto_amount_1 = require("./crypto_amount");
/**
 * A representation of a Fund Operation.
 */
class FundOperation {
    /**
     * Creates a new FundOperation instance.
     *
     * @param model - The model representing the fund operation
     */
    constructor(model) {
        this.asset = null;
        this.model = model;
    }
    /**
     * Converts a FundOperationModel into a FundOperation object.
     *
     * @param fundOperationModel - The FundOperation model object.
     * @returns The FundOperation object.
     */
    static fromModel(fundOperationModel) {
        return new FundOperation(fundOperationModel);
    }
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
    static async create(walletId, addressId, amount, assetId, networkId, quote) {
        const asset = await asset_1.Asset.fetch(networkId, assetId);
        const createRequest = {
            amount: asset.toAtomicAmount(amount).toString(),
            asset_id: asset_1.Asset.primaryDenomination(assetId),
        };
        if (quote) {
            Object.assign(createRequest, { fund_quote_id: quote.getId() });
        }
        const response = await coinbase_1.Coinbase.apiClients.fund.createFundOperation(walletId, addressId, createRequest);
        return FundOperation.fromModel(response.data);
    }
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
    static async listFundOperations(walletId, addressId, { limit = coinbase_1.Coinbase.defaultPageLimit, page = undefined } = {}) {
        const data = [];
        let nextPage;
        const response = await coinbase_1.Coinbase.apiClients.fund.listFundOperations(walletId, addressId, limit, page);
        response.data.data.forEach(operationModel => {
            data.push(FundOperation.fromModel(operationModel));
        });
        const hasMore = response.data.has_more;
        if (hasMore) {
            if (response.data.next_page) {
                nextPage = response.data.next_page;
            }
        }
        return {
            data,
            hasMore,
            nextPage,
        };
    }
    /**
     * Gets the Fund Operation ID.
     *
     * @returns {string} The unique identifier of the fund operation
     */
    getId() {
        return this.model.fund_operation_id;
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
     * @returns {Asset} The asset associated with this operation
     */
    getAsset() {
        if (!this.asset) {
            this.asset = asset_1.Asset.fromModel(this.model.crypto_amount.asset);
        }
        return this.asset;
    }
    /**
     * Gets the amount.
     *
     * @returns {CryptoAmount} The crypto amount
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
     * Returns the Status of the Transfer.
     *
     * @returns The Status of the Transfer.
     */
    getStatus() {
        switch (this.model.status) {
            case types_1.FundOperationStatus.PENDING:
                return types_1.FundOperationStatus.PENDING;
            case types_1.FundOperationStatus.COMPLETE:
                return types_1.FundOperationStatus.COMPLETE;
            case types_1.FundOperationStatus.FAILED:
                return types_1.FundOperationStatus.FAILED;
            default:
                throw new Error(`Unknown fund operation status: ${this.model.status}`);
        }
    }
    /**
     * Reloads the fund operation from the server.
     *
     * @returns {Promise<FundOperation>} A promise that resolves to the updated fund operation
     */
    async reload() {
        const response = await coinbase_1.Coinbase.apiClients.fund.getFundOperation(this.getWalletId(), this.getAddressId(), this.getId());
        this.model = response.data;
        return this;
    }
    /**
     * Wait for the fund operation to complete.
     *
     * @param options - Options for waiting
     * @param options.intervalSeconds - The interval between checks in seconds
     * @param options.timeoutSeconds - The timeout in seconds
     * @returns The completed fund operation
     * @throws {TimeoutError} If the operation takes too long
     */
    async wait({ intervalSeconds = 0.2, timeoutSeconds = 20 } = {}) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutSeconds * 1000) {
            await this.reload();
            if (this.isTerminalState()) {
                return this;
            }
            await (0, utils_1.delay)(intervalSeconds);
        }
        throw new errors_1.TimeoutError("Fund operation timed out");
    }
    /**
     * Check if the operation is in a terminal state.
     *
     * @returns {boolean} True if the operation is in a terminal state, false otherwise
     */
    isTerminalState() {
        return FundOperation.Status.TERMINAL_STATES.has(this.getStatus());
    }
}
exports.FundOperation = FundOperation;
/**
 * Fund Operation status constants.
 */
FundOperation.Status = {
    TERMINAL_STATES: new Set(["complete", "failed"]),
};
