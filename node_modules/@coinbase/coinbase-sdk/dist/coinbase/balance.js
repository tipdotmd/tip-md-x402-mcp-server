"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Balance = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const asset_1 = require("./asset");
/** A representation of a balance. */
class Balance {
    /**
     * Private constructor to prevent direct instantiation outside of the factory methods.
     *
     * @ignore
     * @param {Decimal} amount - The amount of the balance.
     * @param {string} assetId - The asset ID.
     * @hideconstructor
     */
    constructor(amount, assetId, asset) {
        this.amount = amount;
        this.assetId = assetId;
        this.asset = asset;
    }
    /**
     * Converts a BalanceModel into a Balance object.
     *
     * @param {BalanceModel} model - The balance model object.
     * @returns {Balance} The Balance object.
     */
    static fromModel(model) {
        const asset = asset_1.Asset.fromModel(model.asset);
        return new Balance(asset.fromAtomicAmount(new decimal_js_1.default(model.amount)), asset.getAssetId(), asset);
    }
    /**
     * Converts a BalanceModel and asset ID into a Balance object.
     *
     * @param {BalanceModel} model - The balance model object.
     * @param {string} assetId - The asset ID.
     * @returns {Balance} The Balance object.
     */
    static fromModelAndAssetId(model, assetId) {
        const asset = asset_1.Asset.fromModel(model.asset, assetId);
        return new Balance(asset.fromAtomicAmount(new decimal_js_1.default(model.amount)), asset.getAssetId(), asset);
    }
}
exports.Balance = Balance;
