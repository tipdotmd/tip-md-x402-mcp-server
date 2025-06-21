import { ethers } from "ethers";
import { StakingOperation as StakingOperationModel, StakingOperationStatusEnum } from "../client/api";
import { Transaction } from "./transaction";
import { Amount } from "./types";
export declare const UnstakeTypeExecution = "execution";
export declare const UnstakeTypeConsensus = "consensus";
/**
 * Checks if the given options contains the unstake type option.
 *
 * @param options - An object containing various options.
 * @returns True if the unstake type is consensus or execution, false otherwise.
 */
export declare function HasUnstakeTypeOption(options: {
    [key: string]: string;
}): boolean;
/**
 * Determines if the given parameters represent a native ETH unstake operation (version 2).
 *
 * @param assetId - The ID of the asset.
 * @param action - The action being performed.
 * @param mode - The mode of the stake options.
 * @param options - An object containing various options.
 * @returns True if the parameters represent a native ETH unstake operation (version 2), false otherwise.
 */
export declare function IsDedicatedEthUnstakeV2Operation(assetId: string, action: string, mode: string, options: {
    [key: string]: string;
}): boolean;
/**
 * A representation of a staking operation (stake, unstake, claim stake, etc.). It
 * may have multiple steps with some being transactions to sign, and others to wait.
 */
export declare class StakingOperation {
    private model;
    private readonly transactions;
    /**
     * Creates a StakingOperation object.
     *
     * @class
     * @param model - The staking operation response from the API call.
     */
    constructor(model: StakingOperationModel);
    /**
     * Get the staking operation for the given ID.
     *
     * @param networkId - The network ID.
     * @param addressId - The address ID.
     * @param id - The staking operation ID.
     * @param walletId - The wallet ID of the staking operation.
     * @throws {Error} If the wallet id is defined but empty.
     *
     * @returns The staking operation object.
     */
    static fetch(networkId: string, addressId: string, id: string, walletId?: string): Promise<StakingOperation>;
    /**
     * Returns the Staking Operation ID.
     *
     * @returns The Staking Operation ID.
     */
    getID(): string;
    /**
     * Get the status of the staking operation.
     *
     * @returns The status of the staking operation.
     */
    getStatus(): StakingOperationStatusEnum;
    /**
     * Returns the Wallet ID if it exists.
     *
     * @returns The Wallet ID.
     */
    getWalletID(): string | undefined;
    /**
     * Returns the Address ID.
     *
     * @returns The Address ID.
     */
    getAddressID(): string;
    /**
     * Returns the Network ID.
     *
     * @returns The Network ID.
     */
    getNetworkID(): string;
    /**
     * Return a human-readable string representation of the StakingOperation object.
     *
     * @returns The string representation of the StakingOperation object.
     */
    toString(): string;
    /**
     * Returns whether the Staking operation is in a terminal State.
     *
     * @returns Whether the Staking operation is in a terminal State
     */
    isTerminalState(): boolean;
    /**
     * Returns whether the Staking operation is in a failed state.
     *
     * @returns Whether the Staking operation is in a failed state.
     */
    isFailedState(): boolean;
    /**
     * Returns whether the Staking operation is in a complete state.
     *
     * @returns Whether the Staking operation is in a complete state.
     */
    isCompleteState(): boolean;
    /**
     * Get the transactions associated with this staking operation.
     *
     * @returns The array of transactions.
     */
    getTransactions(): Transaction[];
    /**
     * Get signed voluntary exit messages for native eth unstaking
     *
     * @returns The signed voluntary exit messages for a native eth unstaking operation.
     */
    getSignedVoluntaryExitMessages(): string[];
    /**
     * Reloads the StakingOperation model with the latest data from the server.
     * If the StakingOperation object was created by an ExternalAddress then it will
     * not have a wallet ID.
     *
     * @throws {APIError} if the API request to get the StakingOperation fails.
     * @throws {Error} if this function is called on a StakingOperation without a wallet ID.
     */
    reload(): Promise<void>;
    /**
     * Waits until the Staking Operation is completed or failed by polling its status at the given interval.
     *
     * @param options - The options to configure the wait function.
     * @param options.intervalSeconds - The interval at which to poll, in seconds
     * @param options.timeoutSeconds - The maximum amount of time to wait for the StakingOperation to complete, in seconds
     * @throws {Error} If the StakingOperation takes longer than the given timeout.
     * @returns The completed StakingOperation object.
     */
    wait({ intervalSeconds, timeoutSeconds, }?: {
        intervalSeconds?: number | undefined;
        timeoutSeconds?: number | undefined;
    }): Promise<StakingOperationModel>;
    /**
     * Sign the transactions in the StakingOperation object.
     *
     * @param key - The key used to sign the transactions.
     */
    sign(key: ethers.Wallet): Promise<void>;
    /**
     * loadTransactionsFromModel loads new unsigned transactions from the model into the transactions array.
     * Note: For External Address model since tx signing and broadcast status happens by the end user and not our backend
     * we need to be careful to not overwrite the transactions array with the response from the API. Ex: End user could have used
     * stakingOperation.sign() method to sign the transactions, and we should not overwrite them with the response from the API.
     * This however is ok to do so for the Wallet Address model since the transactions states are maintained by our backend.
     * This method attempts to be safe for both address models, and only adds newly created unsigned transactions that are not
     *  already in the transactions array.
     */
    private loadTransactionsFromModel;
}
/**
 * A builder class for creating execution layer withdrawal options.
 */
export declare class ExecutionLayerWithdrawalOptionsBuilder {
    private readonly networkId;
    private validatorAmounts;
    /**
     * Creates an instance of ExecutionLayerWithdrawalOptionsBuilder.
     *
     * @param networkId - The network ID.
     */
    constructor(networkId: string);
    /**
     * Adds a validator withdrawal with the specified public key and amount.
     *
     * @param pubKey - The public key of the validator.
     * @param amount - The amount to withdraw.
     */
    addValidatorWithdrawal(pubKey: string, amount: Amount): void;
    /**
     * Builds the execution layer withdrawal options.
     *
     * @param options - Existing options to merge with the built options.
     * @returns A promise that resolves to an object containing the execution layer withdrawal options merged with any provided options.
     */
    build(options?: {
        [key: string]: string;
    }): Promise<{
        [key: string]: string;
    }>;
}
/**
 * A builder class for creating consensus layer exit options.
 */
export declare class ConsensusLayerExitOptionBuilder {
    private validatorPubKeys;
    /**
     * Adds a validator public key to the list of validators.
     *
     * @param pubKey - The public key of the validator.
     */
    addValidator(pubKey: string): void;
    /**
     * Builds the consensus layer exit options.
     *
     * @param options - Existing options to merge with the built options.
     * @returns A promise that resolves to an object containing the consensus layer exit options merged with any provided options.
     */
    build(options?: {
        [key: string]: string;
    }): Promise<{
        [key: string]: string;
    }>;
}
