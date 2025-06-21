"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StakingReward = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const coinbase_1 = require("./coinbase");
const asset_1 = require("./asset");
const types_1 = require("./types");
/**
 * A representation of a staking reward earned on a network for a given asset.
 */
class StakingReward {
    /**
     * Creates the StakingReward object.
     *
     * @param model - The underlying staking reward object.
     * @param asset - The asset for the staking reward.
     * @param format - The format to return the rewards in. (usd, native). Defaults to usd.
     */
    constructor(model, asset, format) {
        this.model = model;
        this.asset = asset;
        this.format = format;
    }
    /**
     * Returns a list of StakingRewards for the provided network, asset, and addresses.
     *
     * @param networkId - The network ID.
     * @param assetId - The asset ID.
     * @param addressIds - The address ID.
     * @param startTime - The start time.
     * @param endTime - The end time.
     * @param format - The format to return the rewards in. (usd, native). Defaults to usd.
     * @returns The staking rewards.
     */
    static async list(networkId, assetId, addressIds, startTime, endTime, format = types_1.StakingRewardFormat.USD) {
        const stakingRewards = [];
        const queue = [""];
        while (queue.length > 0) {
            const page = queue.shift();
            const request = {
                network_id: coinbase_1.Coinbase.normalizeNetwork(networkId),
                asset_id: assetId,
                address_ids: addressIds,
                start_time: startTime,
                end_time: endTime,
                format: format,
            };
            const response = await coinbase_1.Coinbase.apiClients.stake.fetchStakingRewards(request, 100, page?.length ? page : undefined);
            const asset = await asset_1.Asset.fetch(networkId, assetId);
            response.data.data.forEach(stakingReward => {
                stakingRewards.push(new StakingReward(stakingReward, asset, format));
            });
            if (response.data.has_more) {
                if (response.data.next_page) {
                    queue.push(response.data.next_page);
                }
            }
        }
        return stakingRewards;
    }
    /**
     * Returns the amount of the StakingReward.
     *
     * @returns The amount.
     */
    amount() {
        if (this.model.amount == "")
            return 0;
        if (this.format == types_1.StakingRewardFormat.USD) {
            return new decimal_js_1.default(this.model.amount).div(new decimal_js_1.default("100"));
        }
        return this.asset.fromAtomicAmount(new decimal_js_1.default(this.model.amount)).toNumber();
    }
    /**
     * Returns the date of the StakingReward.
     *
     * @returns The date.
     */
    date() {
        return new Date(this.model.date);
    }
    /**
     * Returns the onchain address of the StakingReward.
     *
     * @returns The onchain address.
     */
    addressId() {
        return this.model.address_id;
    }
    /**
     * Returns the USD value of the StakingReward.
     *
     * @returns The USD value.
     */
    usdValue() {
        return new decimal_js_1.default(this.model.usd_value.amount).div(new decimal_js_1.default("100"));
    }
    /**
     * Returns the conversion price of the StakingReward in USD.
     *
     * @returns The conversion price.
     */
    conversionPrice() {
        return new decimal_js_1.default(this.model.usd_value.conversion_price);
    }
    /**
     * Returns the time of calculating the conversion price.
     *
     * @returns The conversion time.
     */
    conversionTime() {
        return new Date(this.model.usd_value.conversion_time);
    }
    /**
     * Print the Staking Reward as a string.
     *
     * @returns The string representation of the Staking Reward.
     */
    toString() {
        return `StakingReward { date: '${this.date().toISOString()}' address: '${this.addressId()}' amount: '${this.amount().toString()}' usd_value: '${this.usdValue().toString()}' conversion_price: '${this.conversionPrice().toString()}' conversion_time: '${this.conversionTime().toISOString()}' }`;
    }
}
exports.StakingReward = StakingReward;
