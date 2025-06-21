"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalAddress = void 0;
const address_1 = require("../address");
const types_1 = require("../types");
const coinbase_1 = require("../coinbase");
const decimal_js_1 = __importDefault(require("decimal.js"));
const asset_1 = require("../asset");
const staking_operation_1 = require("../staking_operation");
/**
 * A representation of a blockchain Address, which is a user-controlled account on a Network. Addresses are used to
 * send and receive Assets. An ExternalAddress is an Address that is not controlled by the developer, but is instead
 * controlled by the user.
 */
class ExternalAddress extends address_1.Address {
    /**
     * Builds a stake operation for the supplied asset. The stake operation
     * may take a few minutes to complete in the case when infrastructure is spun up.
     *
     * @param amount - The amount of the asset to stake.
     * @param assetId - The asset to stake.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for the stake operation:
     *
     * A. Shared ETH Staking
     *  - `integrator_contract_address` (optional): The contract address to which the stake operation is directed to. Defaults to the integrator contract address associated with CDP account (if available) or else defaults to a shared integrator contract address for that network.
     *
     * B. Dedicated ETH Staking
     *  - `funding_address` (optional): Ethereum address for funding the stake operation. Defaults to the address initiating the stake operation.
     *  - `withdrawal_address` (optional): Ethereum address for receiving rewards and withdrawal funds. Defaults to the address initiating the stake operation.
     *  - `fee_recipient_address` (optional): Ethereum address for receiving transaction fees. Defaults to the address initiating the stake operation.
     *
     * @returns The stake operation.
     */
    async buildStakeOperation(amount, assetId, mode = types_1.StakeOptionsMode.DEFAULT, options = {}) {
        await this.validateCanStake(amount, assetId, mode, options);
        return this.buildStakingOperation(amount, assetId, "stake", mode, options);
    }
    /**
     * Builds an unstake operation for the supplied asset.
     *
     * @param amount - The amount of the asset to unstake.
     * @param assetId - The asset to unstake.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for the unstake operation:
     *
     * A. Shared ETH Staking
     *  - `integrator_contract_address` (optional): The contract address to which the unstake operation is directed to. Defaults to the integrator contract address associated with CDP account (if available) or else defaults to a shared integrator contract address for that network.
     *
     * B. Dedicated ETH Staking
     *  - `immediate` (optional): Set this to "true" to unstake immediately i.e. leverage "Coinbase managed unstake" process . Defaults to "false" i.e. "User managed unstake" process.
     *  - `validator_pub_keys` (optional): List of comma separated validator public keys to unstake. Defaults to validators being picked up on your behalf corresponding to the unstake amount.
     *
     * @returns The unstake operation.
     */
    async buildUnstakeOperation(amount, assetId, mode = types_1.StakeOptionsMode.DEFAULT, options = {}) {
        // If performing a native eth unstake v2, validation is always performed server-side.
        if (!(0, staking_operation_1.IsDedicatedEthUnstakeV2Operation)(assetId, "unstake", mode, options)) {
            await this.validateCanUnstake(amount, assetId, mode, options);
        }
        return this.buildStakingOperation(amount, assetId, "unstake", mode, options);
    }
    /**
     * Builds a claim stake operation for the supplied asset.
     *
     * @param amount - The amount of the asset to claim stake.
     * @param assetId - The asset to claim stake.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for the claim stake operation.
     *
     * A. Shared ETH Staking
     *  - `integrator_contract_address` (optional): The contract address to which the claim stake operation is directed to. Defaults to the integrator contract address associated with CDP account (if available) or else defaults to a shared integrator contract address for that network.
     *
     * @returns The claim stake operation.
     */
    async buildClaimStakeOperation(amount, assetId, mode = types_1.StakeOptionsMode.DEFAULT, options = {}) {
        await this.validateCanClaimStake(amount, assetId, mode, options);
        return this.buildStakingOperation(amount, assetId, "claim_stake", mode, options);
    }
    /**
     * Builds a validator consolidation operation to help consolidate validators post Pectra.
     *
     * @param options - Additional options for the validator consolidation operation.
     *
     * @returns The validator consolidation operation.
     */
    async buildValidatorConsolidationOperation(options = {}) {
        return this.buildStakingOperation(0, "eth", "consolidate", types_1.StakeOptionsMode.NATIVE, options);
    }
    /**
     * Builds the staking operation based on the supplied input.
     *
     * @param amount - The amount for the staking operation.
     * @param assetId - The asset for the staking operation.
     * @param action - The specific action for the staking operation. e.g. stake, unstake, claim_stake
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options to build a stake operation.
     * @private
     * @returns The staking operation.
     * @throws {Error} If the supplied input cannot build a valid staking operation.
     */
    async buildStakingOperation(amount, assetId, action, mode, options) {
        const asset = await asset_1.Asset.fetch(this.getNetworkId(), assetId);
        const newOptions = this.copyOptions(options);
        newOptions.mode = mode;
        newOptions.amount = asset.toAtomicAmount(new decimal_js_1.default(amount.toString())).toString();
        const request = {
            network_id: this.getNetworkId(),
            asset_id: asset_1.Asset.primaryDenomination(assetId),
            address_id: this.getId(),
            action: action,
            options: newOptions,
        };
        const response = await coinbase_1.Coinbase.apiClients.stake.buildStakingOperation(request);
        return new staking_operation_1.StakingOperation(response.data);
    }
    /**
     * Broadcast an external transaction
     *
     * @param signedPayload - The signed payload of the transaction to broadcast
     * @returns The broadcasted transaction
     */
    async broadcastExternalTransaction(signedPayload) {
        const response = await coinbase_1.Coinbase.apiClients.externalAddress.broadcastExternalTransaction(this.getNetworkId(), this.getId(), {
            signed_payload: signedPayload,
        });
        return {
            transactionHash: response.data.transaction_hash,
            transactionLink: response.data.transaction_link,
        };
    }
}
exports.ExternalAddress = ExternalAddress;
