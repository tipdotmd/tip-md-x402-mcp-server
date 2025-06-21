"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoricalBalance = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const asset_1 = require("./asset");
/** A representation of historical balance. */
class HistoricalBalance {
    /**
     * Private constructor to prevent direct instantiation outside of the factory methods.
     *
     * @ignore
     * @param {Decimal} amount - The amount of the balance.
     * @param {Decimal} blockHeight - The block height at which the balance was recorded.
     * @param {string} blockHash - The block hash at which the balance was recorded
     * @param {string} asset - The asset we want to fetch.
     * @hideconstructor
     */
    constructor(amount, blockHeight, blockHash, asset) {
        this.amount = amount;
        this.blockHeight = blockHeight;
        this.blockHash = blockHash;
        this.asset = asset;
    }
    /**
     * Converts a HistoricalBalanceModel into a HistoricalBalance object.
     *
     * @param {HistoricalBalanceModel} model - The historical balance model object.
     * @returns {HistoricalBalance} The HistoricalBalance object.
     */
    static fromModel(model) {
        const asset = asset_1.Asset.fromModel(model.asset);
        return new HistoricalBalance(asset.fromAtomicAmount(new decimal_js_1.default(model.amount)), new decimal_js_1.default(model.block_height), model.block_hash, asset);
    }
}
exports.HistoricalBalance = HistoricalBalance;
