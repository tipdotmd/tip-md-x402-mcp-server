import { StakingReward as StakingRewardModel } from "../client";
import { Asset } from "./asset";
import { Amount, StakingRewardFormat } from "./types";
/**
 * A representation of a staking reward earned on a network for a given asset.
 */
export declare class StakingReward {
    private model;
    private asset;
    private readonly format;
    /**
     * Creates the StakingReward object.
     *
     * @param model - The underlying staking reward object.
     * @param asset - The asset for the staking reward.
     * @param format - The format to return the rewards in. (usd, native). Defaults to usd.
     */
    constructor(model: StakingRewardModel, asset: Asset, format: StakingRewardFormat);
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
    static list(networkId: string, assetId: string, addressIds: Array<string>, startTime: string, endTime: string, format?: StakingRewardFormat): Promise<StakingReward[]>;
    /**
     * Returns the amount of the StakingReward.
     *
     * @returns The amount.
     */
    amount(): Amount;
    /**
     * Returns the date of the StakingReward.
     *
     * @returns The date.
     */
    date(): Date;
    /**
     * Returns the onchain address of the StakingReward.
     *
     * @returns The onchain address.
     */
    addressId(): string;
    /**
     * Returns the USD value of the StakingReward.
     *
     * @returns The USD value.
     */
    usdValue(): Amount;
    /**
     * Returns the conversion price of the StakingReward in USD.
     *
     * @returns The conversion price.
     */
    conversionPrice(): Amount;
    /**
     * Returns the time of calculating the conversion price.
     *
     * @returns The conversion time.
     */
    conversionTime(): Date;
    /**
     * Print the Staking Reward as a string.
     *
     * @returns The string representation of the Staking Reward.
     */
    toString(): string;
}
