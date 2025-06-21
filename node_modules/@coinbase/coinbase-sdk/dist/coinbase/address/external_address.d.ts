import { Address } from "../address";
import { Amount, BroadcastExternalTransactionResponse, StakeOptionsMode } from "../types";
import { StakingOperation } from "../staking_operation";
/**
 * A representation of a blockchain Address, which is a user-controlled account on a Network. Addresses are used to
 * send and receive Assets. An ExternalAddress is an Address that is not controlled by the developer, but is instead
 * controlled by the user.
 */
export declare class ExternalAddress extends Address {
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
    buildStakeOperation(amount: Amount, assetId: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }): Promise<StakingOperation>;
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
    buildUnstakeOperation(amount: Amount, assetId: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }): Promise<StakingOperation>;
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
    buildClaimStakeOperation(amount: Amount, assetId: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }): Promise<StakingOperation>;
    /**
     * Builds a validator consolidation operation to help consolidate validators post Pectra.
     *
     * @param options - Additional options for the validator consolidation operation.
     *
     * @returns The validator consolidation operation.
     */
    buildValidatorConsolidationOperation(options?: {
        [key: string]: string;
    }): Promise<StakingOperation>;
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
    private buildStakingOperation;
    /**
     * Broadcast an external transaction
     *
     * @param signedPayload - The signed payload of the transaction to broadcast
     * @returns The broadcasted transaction
     */
    broadcastExternalTransaction(signedPayload: string): Promise<BroadcastExternalTransactionResponse>;
}
