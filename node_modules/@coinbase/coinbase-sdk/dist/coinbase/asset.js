"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Asset = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const coinbase_1 = require("./coinbase");
const constants_1 = require("./constants");
const errors_1 = require("./errors");
/** A representation of an Asset. */
class Asset {
    /**
     * Private constructor for the Asset class.
     *
     * @param networkId - The network ID.
     * @param assetId - The asset ID.
     * @param contractAddress - The address ID.
     * @param decimals - The number of decimals.
     */
    constructor(networkId, assetId, contractAddress, decimals) {
        this.networkId = networkId;
        this.assetId = assetId;
        this.contractAddress = contractAddress;
        this.decimals = decimals;
    }
    /**
     * Creates an Asset from an Asset Model.
     *
     * @param model - The Asset Model.
     * @param assetId - The Asset ID.
     * @throws If the Asset Model is invalid.
     * @returns The Asset Class.
     */
    static fromModel(model, assetId) {
        if (!model) {
            throw new Error("Invalid asset model");
        }
        let decimals = model.decimals;
        // TODO: Push this logic down to the backend.
        if (assetId && model.asset_id) {
            const normalizedModelAssetId = model.asset_id.toLowerCase();
            const normalizedAssetId = assetId.toLowerCase();
            if (coinbase_1.Coinbase.toAssetId(normalizedModelAssetId) !== coinbase_1.Coinbase.toAssetId(normalizedAssetId)) {
                switch (normalizedAssetId) {
                    case "gwei":
                        decimals = constants_1.GWEI_DECIMALS;
                        break;
                    case "wei":
                        decimals = 0;
                        break;
                    case "eth":
                        break;
                    default:
                        throw new errors_1.ArgumentError(`Invalid asset ID: ${assetId}`);
                }
            }
        }
        return new Asset(model.network_id, assetId ?? model.asset_id, model.contract_address, decimals);
    }
    /**
     * Fetches the Asset with the provided Asset ID.
     *
     * @param networkId - The network ID.
     * @param assetId - The asset ID.
     * @throws If the Asset cannot be fetched.
     * @returns The Asset Class.
     */
    static async fetch(networkId, assetId) {
        const asset = await coinbase_1.Coinbase.apiClients.asset.getAsset(coinbase_1.Coinbase.normalizeNetwork(networkId), Asset.primaryDenomination(assetId));
        return Asset.fromModel(asset?.data, assetId);
    }
    /**
     * Returns the primary denomination for the provided Asset ID.
     * For `gwei` and `wei` the primary denomination is `eth`.
     * For all other assets, the primary denomination is the same asset ID.
     *
     * @param assetId - The Asset ID.
     * @returns The primary denomination for the Asset ID.
     */
    static primaryDenomination(assetId) {
        return [coinbase_1.Coinbase.assets.Gwei, coinbase_1.Coinbase.assets.Wei].includes(assetId)
            ? coinbase_1.Coinbase.assets.Eth
            : assetId;
    }
    /**
     * Returns the primary denomination for the Asset.
     *
     * @returns The primary denomination for the Asset.
     */
    primaryDenomination() {
        return Asset.primaryDenomination(this.assetId);
    }
    /**
     * Converts the amount of the Asset from whole to atomic units.
     *
     * @param wholeAmount - The whole amount to convert to atomic units.
     * @returns The amount in atomic units
     */
    toAtomicAmount(wholeAmount) {
        const atomicAmount = wholeAmount.times(new decimal_js_1.default(10).pow(this.decimals));
        return BigInt(atomicAmount.toFixed());
    }
    /**
     * Converts the amount of the Asset from atomic to whole units.
     *
     * @param atomicAmount - The atomic amount to convert to whole units.
     * @returns The amount in atomic units
     */
    fromAtomicAmount(atomicAmount) {
        return atomicAmount.dividedBy(new decimal_js_1.default(10).pow(this.decimals));
    }
    /**
     * Returns a string representation of the Asset.
     *
     * @returns a string representation of the Asset
     */
    toString() {
        return `Asset{ networkId: ${this.networkId}, assetId: ${this.assetId}, contractAddress: ${this.contractAddress}, decimals: ${this.decimals} }`;
    }
    /**
     * Returns the Asset ID.
     *
     * @returns The Asset ID.
     */
    getAssetId() {
        return this.assetId;
    }
}
exports.Asset = Asset;
