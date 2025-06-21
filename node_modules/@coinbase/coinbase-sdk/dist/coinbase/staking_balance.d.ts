import { StakingBalance as StakingBalanceModel } from "../client";
import { Balance } from "./balance";
/**
 * A representation of the staking balance for a given asset on a specific date.
 */
export declare class StakingBalance {
    private model;
    /**
     * Creates the StakingBalance object.
     *
     * @param model - The underlying staking balance object.
     */
    constructor(model: StakingBalanceModel);
    /**
     * Returns a list of StakingBalances for the provided network, asset, and address.
     *
     * @param networkId - The network ID.
     * @param assetId - The asset ID.
     * @param addressId - The address ID.
     * @param startTime - The start time.
     * @param endTime - The end time.
     * @returns The staking balances.
     */
    static list(networkId: string, assetId: string, addressId: string, startTime: string, endTime: string): Promise<StakingBalance[]>;
    /**
     * Returns the bonded stake amount of the StakingBalance.
     *
     * @returns The Balance.
     */
    bondedStake(): Balance;
    /**
     * Returns the unbonded stake amount of the StakingBalance.
     *
     * @returns The Balance.
     */
    unbondedBalance(): Balance;
    /**
     * Returns the participant type of the address.
     *
     * @returns The participant type.
     */
    participantType(): string;
    /**
     * Returns the date of the StakingBalance.
     *
     * @returns The date.
     */
    date(): Date;
    /**
     * Returns the onchain address of the StakingBalance.
     *
     * @returns The onchain address.
     */
    address(): string;
    /**
     * Print the Staking Balance as a string.
     *
     * @returns The string representation of the Staking Balance.
     */
    toString(): string;
}
