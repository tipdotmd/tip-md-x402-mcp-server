import Decimal from "decimal.js";
import { BalanceMap } from "./balance_map";
import { FaucetTransaction } from "./faucet_transaction";
import { HistoricalBalance } from "./historical_balance";
import { Amount, StakeOptionsMode, StakingRewardFormat, PaginationOptions, PaginationResponse } from "./types";
import { StakingReward } from "./staking_reward";
import { StakingBalance } from "./staking_balance";
import { Transaction } from "./transaction";
import { AddressReputation } from "./address_reputation";
/**
 * A representation of a blockchain address, which is a user-controlled account on a network.
 */
export declare class Address {
    private static MAX_HISTORICAL_BALANCE;
    protected networkId: string;
    protected id: string;
    protected _reputation?: AddressReputation;
    /**
     * Initializes a new Address instance.
     *
     * @param networkId - The network id.
     * @param id - The onchain address id.
     */
    constructor(networkId: string, id: string);
    /**
     * Returns the network ID.
     *
     * @returns The network ID.
     */
    getNetworkId(): string;
    /**
     * Returns the address ID.
     *
     * @returns The address ID.
     */
    getId(): string;
    /**
     * Returns the list of balances for the address.
     *
     * @returns The map from asset ID to balance.
     */
    listBalances(): Promise<BalanceMap>;
    /**
     * Returns the balance of the provided asset.
     *
     * @param assetId - The asset ID.
     * @returns The balance of the asset.
     */
    getBalance(assetId: string): Promise<Decimal>;
    /**
     * Returns the historical balances of the provided asset.
     *
     * @param assetId - The asset ID.
     * @param options - The pagination options.
     * @param options.limit - The maximum number of Historical Balances to return. Limit can range between 1 and 100.
     * @param options.page - The cursor for pagination across multiple pages of Historical Balances. Don\&#39;t include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     *
     * @returns The paginated list response of Historical Balances for the given Asset ID.
     */
    listHistoricalBalances(assetId: string, { limit, page }?: PaginationOptions): Promise<PaginationResponse<HistoricalBalance>>;
    /**
     * Returns the transactions of the address.
     *
     * @param options - The pagination options.
     * @param options.limit - The maximum number of Transactions to return. Limit can range between 1 and 100.
     * @param options.page - The cursor for pagination across multiple pages of Transactions. Don\&#39;t include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     *
     * @returns The paginated list response of Transactions.
     */
    listTransactions({ limit, page, }?: PaginationOptions): Promise<PaginationResponse<Transaction>>;
    /**
     * Lists the staking rewards for the address.
     *
     * @param assetId - The asset ID.
     * @param startTime - The start time.
     * @param endTime - The end time.
     * @param format - The format to return the rewards in. (usd, native). Defaults to usd.
     * @returns The staking rewards.
     */
    stakingRewards(assetId: string, startTime?: string, endTime?: string, format?: StakingRewardFormat): Promise<StakingReward[]>;
    /**
     * Lists the historical staking balances for the address.
     *
     * @param assetId - The asset ID.
     * @param startTime - The start time.
     * @param endTime - The end time.
     * @returns The staking balances.
     */
    historicalStakingBalances(assetId: string, startTime?: string, endTime?: string): Promise<StakingBalance[]>;
    /**
     * Get the stakeable balance for the supplied asset.
     *
     * @param asset_id - The asset to check the stakeable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the stakeable balance.
     * @returns The stakeable balance.
     */
    stakeableBalance(asset_id: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }): Promise<Decimal>;
    /**
     * Get the unstakeable balance for the supplied asset.
     *
     * @param asset_id - The asset to check the unstakeable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the unstakeable balance.
     * A. Dedicated ETH Staking
     *  - `validator_pub_keys` (optional): List of comma separated validator public keys to retrieve unstakeable balance for. Defaults to all validators.
     * @returns The unstakeable balance.
     */
    unstakeableBalance(asset_id: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }): Promise<Decimal>;
    /**
     * Get the claimable balance for the supplied asset.
     *
     * @param asset_id - The asset to check claimable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the claimable balance.
     * @returns The claimable balance.
     */
    claimableBalance(asset_id: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }): Promise<Decimal>;
    /**
     * Get the pending claimable balance for the supplied asset.
     *
     * @param asset_id - The asset to check pending claimable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the pending claimable balance.
     * @returns The pending claimable balance.
     */
    pendingClaimableBalance(asset_id: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }): Promise<Decimal>;
    /**
     * Requests faucet funds for the address.
     * Only supported on testnet networks.
     *
     * @param assetId - The ID of the asset to transfer from the faucet.
     * @returns The faucet transaction object.
     * @throws {Error} If the request does not return a transaction hash.
     * @throws {Error} If the request fails.
     */
    faucet(assetId?: string): Promise<FaucetTransaction>;
    /**
     * Returns the reputation of the Address.
     *
     * @returns The reputation of the Address.
     * @throws {Error} if the API request to get the Address reputation fails.
     * @throws {Error} if the Address reputation is not available.
     */
    reputation(): Promise<AddressReputation>;
    /**
     * Returns a string representation of the address.
     *
     * @returns A string representing the address.
     */
    toString(): string;
    /**
     * Validate if the operation is able to stake with the supplied input.
     *
     * @param amount - The amount of the asset to stake.
     * @param assetId - The asset to stake.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for the stake operation.
     * @private
     * @throws {Error} If the supplied input is not able to create a stake operation.
     */
    protected validateCanStake(amount: Amount, assetId: string, mode: StakeOptionsMode, options: {
        [key: string]: string;
    }): Promise<void>;
    /**
     * Validate if the operation is able to unstake with the supplied input.
     *
     * @param amount - The amount of the asset to unstake.
     * @param assetId - The asset to unstake.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for the unstake operation.
     * @private
     * @throws {Error} If the supplied input is not able to create an unstake operation.
     */
    protected validateCanUnstake(amount: Amount, assetId: string, mode: StakeOptionsMode, options: {
        [key: string]: string;
    }): Promise<void>;
    /**
     * Validate if the operation is able to claim stake with the supplied input.
     *
     * @param amount - The amount of the asset to claim stake.
     * @param assetId - The asset to claim stake.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for the claim stake operation.
     * @private
     * @throws {Error} If the supplied input is not able to create a claim stake operation.
     */
    protected validateCanClaimStake(amount: Amount, assetId: string, mode: StakeOptionsMode, options: {
        [key: string]: string;
    }): Promise<void>;
    /**
     * Create a shallow copy of given options.
     *
     * @param options - The supplied options to be copied
     * @private
     * @returns A copy of the options.
     */
    protected copyOptions(options?: {
        [key: string]: string;
    }): {
        [key: string]: string;
    };
    /**
     * Get the different staking balance types for the supplied asset.
     *
     * @param assetId - The asset to lookup balances for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for the balance lookup.
     * @private
     * @returns The different balance types.
     */
    private getStakingBalances;
}
