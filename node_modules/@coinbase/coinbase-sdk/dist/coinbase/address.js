"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
const decimal_js_1 = __importDefault(require("decimal.js"));
const coinbase_1 = require("./coinbase");
const asset_1 = require("./asset");
const balance_1 = require("./balance");
const balance_map_1 = require("./balance_map");
const faucet_transaction_1 = require("./faucet_transaction");
const historical_balance_1 = require("./historical_balance");
const types_1 = require("./types");
const utils_1 = require("./utils");
const staking_reward_1 = require("./staking_reward");
const staking_balance_1 = require("./staking_balance");
const transaction_1 = require("./transaction");
const address_reputation_1 = require("./address_reputation");
/**
 * A representation of a blockchain address, which is a user-controlled account on a network.
 */
class Address {
    /**
     * Initializes a new Address instance.
     *
     * @param networkId - The network id.
     * @param id - The onchain address id.
     */
    constructor(networkId, id) {
        this.networkId = networkId;
        this.id = id;
    }
    /**
     * Returns the network ID.
     *
     * @returns The network ID.
     */
    getNetworkId() {
        return this.networkId;
    }
    /**
     * Returns the address ID.
     *
     * @returns The address ID.
     */
    getId() {
        return this.id;
    }
    /**
     * Returns the list of balances for the address.
     *
     * @returns The map from asset ID to balance.
     */
    async listBalances() {
        const response = await coinbase_1.Coinbase.apiClients.externalAddress.listExternalAddressBalances(this.getNetworkId(), this.getId());
        return balance_map_1.BalanceMap.fromBalances(response.data.data);
    }
    /**
     * Returns the balance of the provided asset.
     *
     * @param assetId - The asset ID.
     * @returns The balance of the asset.
     */
    async getBalance(assetId) {
        const response = await coinbase_1.Coinbase.apiClients.externalAddress.getExternalAddressBalance(this.getNetworkId(), this.getId(), asset_1.Asset.primaryDenomination(assetId));
        if (!response.data) {
            return new decimal_js_1.default(0);
        }
        return balance_1.Balance.fromModelAndAssetId(response.data, assetId).amount;
    }
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
    async listHistoricalBalances(assetId, { limit = coinbase_1.Coinbase.defaultPageLimit, page = undefined } = {}) {
        const data = [];
        let nextPage;
        const response = await coinbase_1.Coinbase.apiClients.balanceHistory.listAddressHistoricalBalance(this.getNetworkId(), this.getId(), asset_1.Asset.primaryDenomination(assetId), limit, page);
        response.data.data.forEach(historicalBalanceModel => {
            const historicalBalance = historical_balance_1.HistoricalBalance.fromModel(historicalBalanceModel);
            data.push(historicalBalance);
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
     * Returns the transactions of the address.
     *
     * @param options - The pagination options.
     * @param options.limit - The maximum number of Transactions to return. Limit can range between 1 and 100.
     * @param options.page - The cursor for pagination across multiple pages of Transactions. Don\&#39;t include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     *
     * @returns The paginated list response of Transactions.
     */
    async listTransactions({ limit = coinbase_1.Coinbase.defaultPageLimit, page = undefined, } = {}) {
        const data = [];
        let nextPage;
        const response = await coinbase_1.Coinbase.apiClients.transactionHistory.listAddressTransactions(this.getNetworkId(), this.getId(), limit, page);
        response.data.data.forEach(transactionModel => {
            const transaction = new transaction_1.Transaction(transactionModel);
            data.push(transaction);
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
     * Lists the staking rewards for the address.
     *
     * @param assetId - The asset ID.
     * @param startTime - The start time.
     * @param endTime - The end time.
     * @param format - The format to return the rewards in. (usd, native). Defaults to usd.
     * @returns The staking rewards.
     */
    async stakingRewards(assetId, startTime = (0, utils_1.getWeekBackDate)(new Date()), endTime = (0, utils_1.formatDate)(new Date()), format = types_1.StakingRewardFormat.USD) {
        return staking_reward_1.StakingReward.list(coinbase_1.Coinbase.normalizeNetwork(this.getNetworkId()), assetId, [this.getId()], startTime, endTime, format);
    }
    /**
     * Lists the historical staking balances for the address.
     *
     * @param assetId - The asset ID.
     * @param startTime - The start time.
     * @param endTime - The end time.
     * @returns The staking balances.
     */
    async historicalStakingBalances(assetId, startTime = (0, utils_1.getWeekBackDate)(new Date()), endTime = (0, utils_1.formatDate)(new Date())) {
        return staking_balance_1.StakingBalance.list(coinbase_1.Coinbase.normalizeNetwork(this.getNetworkId()), assetId, this.getId(), startTime, endTime);
    }
    /**
     * Get the stakeable balance for the supplied asset.
     *
     * @param asset_id - The asset to check the stakeable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the stakeable balance.
     * @returns The stakeable balance.
     */
    async stakeableBalance(asset_id, mode = types_1.StakeOptionsMode.DEFAULT, options = {}) {
        const balances = await this.getStakingBalances(asset_id, mode, options);
        return balances.stakeableBalance;
    }
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
    async unstakeableBalance(asset_id, mode = types_1.StakeOptionsMode.DEFAULT, options = {}) {
        const balances = await this.getStakingBalances(asset_id, mode, options);
        return balances.unstakeableBalance;
    }
    /**
     * Get the claimable balance for the supplied asset.
     *
     * @param asset_id - The asset to check claimable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the claimable balance.
     * @returns The claimable balance.
     */
    async claimableBalance(asset_id, mode = types_1.StakeOptionsMode.DEFAULT, options = {}) {
        const balances = await this.getStakingBalances(asset_id, mode, options);
        return balances.claimableBalance;
    }
    /**
     * Get the pending claimable balance for the supplied asset.
     *
     * @param asset_id - The asset to check pending claimable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the pending claimable balance.
     * @returns The pending claimable balance.
     */
    async pendingClaimableBalance(asset_id, mode = types_1.StakeOptionsMode.DEFAULT, options = {}) {
        const balances = await this.getStakingBalances(asset_id, mode, options);
        return balances.pendingClaimableBalance;
    }
    /**
     * Requests faucet funds for the address.
     * Only supported on testnet networks.
     *
     * @param assetId - The ID of the asset to transfer from the faucet.
     * @returns The faucet transaction object.
     * @throws {Error} If the request does not return a transaction hash.
     * @throws {Error} If the request fails.
     */
    async faucet(assetId) {
        const response = await coinbase_1.Coinbase.apiClients.externalAddress.requestExternalFaucetFunds(this.getNetworkId(), this.getId(), assetId, true);
        return new faucet_transaction_1.FaucetTransaction(response.data);
    }
    /**
     * Returns the reputation of the Address.
     *
     * @returns The reputation of the Address.
     * @throws {Error} if the API request to get the Address reputation fails.
     * @throws {Error} if the Address reputation is not available.
     */
    async reputation() {
        if (this._reputation) {
            return this._reputation;
        }
        const response = await coinbase_1.Coinbase.apiClients.addressReputation.getAddressReputation(this.getNetworkId(), this.getId());
        this._reputation = new address_reputation_1.AddressReputation(response.data);
        return this._reputation;
    }
    /**
     * Returns a string representation of the address.
     *
     * @returns A string representing the address.
     */
    toString() {
        return `Address { addressId: '${this.getId()}', networkId: '${this.getNetworkId()}' }`;
    }
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
    async validateCanStake(amount, assetId, mode, options) {
        const stakeableBalance = await this.stakeableBalance(assetId, mode, options);
        if (new decimal_js_1.default(stakeableBalance).lessThan(amount.toString())) {
            throw new Error(`Insufficient funds ${amount} requested to stake, only ${stakeableBalance} available.`);
        }
    }
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
    async validateCanUnstake(amount, assetId, mode, options) {
        const unstakeableBalance = new decimal_js_1.default(await this.unstakeableBalance(assetId, mode, options));
        if (unstakeableBalance.lessThan(amount.toString())) {
            throw new Error(`Insufficient funds ${amount} requested to unstake, only ${unstakeableBalance} available.`);
        }
    }
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
    async validateCanClaimStake(amount, assetId, mode, options) {
        if (assetId === "eth" && mode === types_1.StakeOptionsMode.NATIVE) {
            throw new Error(`Claiming stake for ETH is not supported in native mode.`);
        }
        const claimableBalance = new decimal_js_1.default(await this.claimableBalance(assetId, mode, options));
        if (claimableBalance.lessThan(amount.toString())) {
            throw new Error(`Insufficient funds ${amount} requested to claim stake, only ${claimableBalance} available.`);
        }
    }
    /**
     * Create a shallow copy of given options.
     *
     * @param options - The supplied options to be copied
     * @private
     * @returns A copy of the options.
     */
    copyOptions(options) {
        return { ...options };
    }
    /**
     * Get the different staking balance types for the supplied asset.
     *
     * @param assetId - The asset to lookup balances for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for the balance lookup.
     * @private
     * @returns The different balance types.
     */
    async getStakingBalances(assetId, mode, options) {
        const newOptions = this.copyOptions(options);
        if (mode) {
            newOptions.mode = mode;
        }
        const request = {
            network_id: this.getNetworkId(),
            asset_id: asset_1.Asset.primaryDenomination(assetId),
            address_id: this.getId(),
            options: newOptions,
        };
        const response = await coinbase_1.Coinbase.apiClients.stake.getStakingContext(request);
        return {
            stakeableBalance: balance_1.Balance.fromModelAndAssetId(response.data.context.stakeable_balance, assetId).amount,
            unstakeableBalance: balance_1.Balance.fromModelAndAssetId(response.data.context.unstakeable_balance, assetId).amount,
            pendingClaimableBalance: balance_1.Balance.fromModelAndAssetId(response.data.context.pending_claimable_balance, assetId).amount,
            claimableBalance: balance_1.Balance.fromModelAndAssetId(response.data.context.claimable_balance, assetId).amount,
        };
    }
}
exports.Address = Address;
Address.MAX_HISTORICAL_BALANCE = 1000;
