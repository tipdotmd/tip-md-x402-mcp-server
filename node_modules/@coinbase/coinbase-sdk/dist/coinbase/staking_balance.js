"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StakingBalance = void 0;
const balance_1 = require("./balance");
const coinbase_1 = require("./coinbase");
/**
 * A representation of the staking balance for a given asset on a specific date.
 */
class StakingBalance {
    /**
     * Creates the StakingBalance object.
     *
     * @param model - The underlying staking balance object.
     */
    constructor(model) {
        this.model = model;
    }
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
    static async list(networkId, assetId, addressId, startTime, endTime) {
        const stakingBalances = [];
        const queue = [""];
        while (queue.length > 0) {
            const page = queue.shift();
            const response = await coinbase_1.Coinbase.apiClients.stake.fetchHistoricalStakingBalances(networkId, assetId, addressId, startTime, endTime, 100, page?.length ? page : undefined);
            response.data.data.forEach(stakingBalance => {
                stakingBalances.push(new StakingBalance(stakingBalance));
            });
            if (response.data.has_more) {
                if (response.data.next_page) {
                    queue.push(response.data.next_page);
                }
            }
        }
        return stakingBalances;
    }
    /**
     * Returns the bonded stake amount of the StakingBalance.
     *
     * @returns The Balance.
     */
    bondedStake() {
        return balance_1.Balance.fromModel(this.model.bonded_stake);
    }
    /**
     * Returns the unbonded stake amount of the StakingBalance.
     *
     * @returns The Balance.
     */
    unbondedBalance() {
        return balance_1.Balance.fromModel(this.model.unbonded_balance);
    }
    /**
     * Returns the participant type of the address.
     *
     * @returns The participant type.
     */
    participantType() {
        return this.model.participant_type;
    }
    /**
     * Returns the date of the StakingBalance.
     *
     * @returns The date.
     */
    date() {
        return new Date(this.model.date);
    }
    /**
     * Returns the onchain address of the StakingBalance.
     *
     * @returns The onchain address.
     */
    address() {
        return this.model.address;
    }
    /**
     * Print the Staking Balance as a string.
     *
     * @returns The string representation of the Staking Balance.
     */
    toString() {
        return `StakingBalance { date: '${this.date().toISOString()}' address: '${this.address()}' bondedStake: '${this.bondedStake().amount} ${this.bondedStake().asset?.assetId?.toUpperCase()}' unbondedBalance: '${this.unbondedBalance().amount} ${this.unbondedBalance().asset?.assetId?.toUpperCase()}' participantType: '${this.participantType()}' }`;
    }
}
exports.StakingBalance = StakingBalance;
