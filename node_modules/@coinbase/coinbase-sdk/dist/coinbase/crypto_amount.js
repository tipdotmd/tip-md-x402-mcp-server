"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoAmount = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const asset_1 = require("./asset");
/**
 * A representation of a CryptoAmount that includes the amount and asset.
 */
class CryptoAmount {
    /**
     * Creates a new CryptoAmount instance.
     *
     * @param amount - The amount of the Asset
     * @param asset - The Asset
     * @param assetId - Optional Asset ID override
     */
    constructor(amount, asset, assetId) {
        this.amount = amount;
        this.assetObj = asset;
        this.assetId = assetId || asset.getAssetId();
    }
    /**
     * Converts a CryptoAmount model to a CryptoAmount.
     *
     * @param amountModel - The crypto amount from the API
     * @returns The converted CryptoAmount object
     */
    static fromModel(amountModel) {
        const asset = asset_1.Asset.fromModel(amountModel.asset);
        return new CryptoAmount(asset.fromAtomicAmount(new decimal_js_1.default(amountModel.amount)), asset);
    }
    /**
     * Converts a CryptoAmount model and asset ID to a CryptoAmount.
     * This can be used to specify a non-primary denomination that we want the amount
     * to be converted to.
     *
     * @param amountModel - The crypto amount from the API
     * @param assetId - The Asset ID of the denomination we want returned
     * @returns The converted CryptoAmount object
     */
    static fromModelAndAssetId(amountModel, assetId) {
        const asset = asset_1.Asset.fromModel(amountModel.asset, assetId);
        return new CryptoAmount(asset.fromAtomicAmount(new decimal_js_1.default(amountModel.amount)), asset, assetId);
    }
    /**
     * Gets the amount of the Asset.
     *
     * @returns The amount of the Asset
     */
    getAmount() {
        return this.amount;
    }
    /**
     * Gets the Asset.
     *
     * @returns The Asset
     */
    getAsset() {
        return this.assetObj;
    }
    /**
     * Gets the Asset ID.
     *
     * @returns The Asset ID
     */
    getAssetId() {
        return this.assetId;
    }
    /**
     * Converts the amount to atomic units.
     *
     * @returns The amount in atomic units
     */
    toAtomicAmount() {
        return this.assetObj.toAtomicAmount(this.amount);
    }
    /**
     * Returns a string representation of the CryptoAmount.
     *
     * @returns A string representation of the CryptoAmount
     */
    toString() {
        return `CryptoAmount{amount: '${this.amount}', assetId: '${this.assetId}'}`;
    }
}
exports.CryptoAmount = CryptoAmount;
