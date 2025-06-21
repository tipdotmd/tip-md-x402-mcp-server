"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsensusLayerExitOptionBuilder = exports.ExecutionLayerWithdrawalOptionsBuilder = exports.StakingOperation = exports.IsDedicatedEthUnstakeV2Operation = exports.HasUnstakeTypeOption = exports.UnstakeTypeConsensus = exports.UnstakeTypeExecution = void 0;
const api_1 = require("../client/api");
const transaction_1 = require("./transaction");
const coinbase_1 = require("./coinbase");
const utils_1 = require("./utils");
const types_1 = require("./types");
const asset_1 = require("./asset");
const decimal_js_1 = __importDefault(require("decimal.js"));
exports.UnstakeTypeExecution = "execution";
exports.UnstakeTypeConsensus = "consensus";
/**
 * Checks if the given options contains the unstake type option.
 *
 * @param options - An object containing various options.
 * @returns True if the unstake type is consensus or execution, false otherwise.
 */
function HasUnstakeTypeOption(options) {
    return (options["unstake_type"] === exports.UnstakeTypeConsensus ||
        options["unstake_type"] === exports.UnstakeTypeExecution);
}
exports.HasUnstakeTypeOption = HasUnstakeTypeOption;
/**
 * Determines if the given parameters represent a native ETH unstake operation (version 2).
 *
 * @param assetId - The ID of the asset.
 * @param action - The action being performed.
 * @param mode - The mode of the stake options.
 * @param options - An object containing various options.
 * @returns True if the parameters represent a native ETH unstake operation (version 2), false otherwise.
 */
function IsDedicatedEthUnstakeV2Operation(assetId, action, mode, options) {
    return (assetId === coinbase_1.Coinbase.assets.Eth &&
        action == "unstake" &&
        mode === types_1.StakeOptionsMode.NATIVE &&
        HasUnstakeTypeOption(options));
}
exports.IsDedicatedEthUnstakeV2Operation = IsDedicatedEthUnstakeV2Operation;
/**
 * A representation of a staking operation (stake, unstake, claim stake, etc.). It
 * may have multiple steps with some being transactions to sign, and others to wait.
 */
class StakingOperation {
    /**
     * Creates a StakingOperation object.
     *
     * @class
     * @param model - The staking operation response from the API call.
     */
    constructor(model) {
        if (!model) {
            throw new Error("Invalid model type");
        }
        this.model = model;
        this.transactions = [];
        this.loadTransactionsFromModel();
    }
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
    static async fetch(networkId, addressId, id, walletId) {
        if (walletId === undefined) {
            const result = await coinbase_1.Coinbase.apiClients.stake.getExternalStakingOperation(networkId, addressId, id);
            return new StakingOperation(result.data);
        }
        else if (walletId != undefined && walletId != "") {
            const result = await coinbase_1.Coinbase.apiClients.walletStake.getStakingOperation(walletId, addressId, id);
            return new StakingOperation(result.data);
        }
        else {
            throw new Error("Invalid wallet ID");
        }
    }
    /**
     * Returns the Staking Operation ID.
     *
     * @returns The Staking Operation ID.
     */
    getID() {
        return this.model.id;
    }
    /**
     * Get the status of the staking operation.
     *
     * @returns The status of the staking operation.
     */
    getStatus() {
        return this.model.status;
    }
    /**
     * Returns the Wallet ID if it exists.
     *
     * @returns The Wallet ID.
     */
    getWalletID() {
        return this.model.wallet_id;
    }
    /**
     * Returns the Address ID.
     *
     * @returns The Address ID.
     */
    getAddressID() {
        return this.model.address_id;
    }
    /**
     * Returns the Network ID.
     *
     * @returns The Network ID.
     */
    getNetworkID() {
        return this.model.network_id;
    }
    /**
     * Return a human-readable string representation of the StakingOperation object.
     *
     * @returns The string representation of the StakingOperation object.
     */
    toString() {
        return `StakingOperation { id: ${this.getID()} status: ${this.getStatus()} network_id: ${this.getNetworkID()} address_id: ${this.getAddressID()} }`;
    }
    /**
     * Returns whether the Staking operation is in a terminal State.
     *
     * @returns Whether the Staking operation is in a terminal State
     */
    isTerminalState() {
        return this.isCompleteState() || this.isFailedState();
    }
    /**
     * Returns whether the Staking operation is in a failed state.
     *
     * @returns Whether the Staking operation is in a failed state.
     */
    isFailedState() {
        return this.getStatus() === api_1.StakingOperationStatusEnum.Failed;
    }
    /**
     * Returns whether the Staking operation is in a complete state.
     *
     * @returns Whether the Staking operation is in a complete state.
     */
    isCompleteState() {
        return this.getStatus() === api_1.StakingOperationStatusEnum.Complete;
    }
    /**
     * Get the transactions associated with this staking operation.
     *
     * @returns The array of transactions.
     */
    getTransactions() {
        return this.transactions;
    }
    /**
     * Get signed voluntary exit messages for native eth unstaking
     *
     * @returns The signed voluntary exit messages for a native eth unstaking operation.
     */
    getSignedVoluntaryExitMessages() {
        const signedVoluntaryExitMessages = [];
        if (this.model.metadata) {
            this.model.metadata.forEach(metadata => {
                const decodedSignedVoluntaryExitMessage = atob(metadata.signed_voluntary_exit);
                signedVoluntaryExitMessages.push(decodedSignedVoluntaryExitMessage);
            });
        }
        return signedVoluntaryExitMessages;
    }
    /**
     * Reloads the StakingOperation model with the latest data from the server.
     * If the StakingOperation object was created by an ExternalAddress then it will
     * not have a wallet ID.
     *
     * @throws {APIError} if the API request to get the StakingOperation fails.
     * @throws {Error} if this function is called on a StakingOperation without a wallet ID.
     */
    async reload() {
        if (this.getWalletID() === undefined) {
            const result = await coinbase_1.Coinbase.apiClients.stake.getExternalStakingOperation(this.getNetworkID(), this.getAddressID(), this.getID());
            this.model = result.data;
        }
        else if (this.getWalletID() != undefined && this.getWalletID() != "") {
            const result = await coinbase_1.Coinbase.apiClients.walletStake.getStakingOperation(this.getWalletID(), this.getAddressID(), this.getID());
            this.model = result.data;
        }
        this.loadTransactionsFromModel();
    }
    /**
     * Waits until the Staking Operation is completed or failed by polling its status at the given interval.
     *
     * @param options - The options to configure the wait function.
     * @param options.intervalSeconds - The interval at which to poll, in seconds
     * @param options.timeoutSeconds - The maximum amount of time to wait for the StakingOperation to complete, in seconds
     * @throws {Error} If the StakingOperation takes longer than the given timeout.
     * @returns The completed StakingOperation object.
     */
    async wait({ intervalSeconds = 5, timeoutSeconds = 3600, } = {}) {
        if (this.getWalletID() != undefined) {
            throw new Error("cannot wait on staking operation for wallet address.");
        }
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutSeconds * 1000) {
            await this.reload();
            if (this.isTerminalState()) {
                return this.model;
            }
            if (Date.now() - startTime > timeoutSeconds * 1000) {
                throw new Error("Staking operation timed out");
            }
            await (0, utils_1.delay)(intervalSeconds);
        }
        throw new Error("Staking operation timed out");
    }
    /**
     * Sign the transactions in the StakingOperation object.
     *
     * @param key - The key used to sign the transactions.
     */
    async sign(key) {
        for (const tx of this.transactions) {
            if (!tx.isSigned()) {
                await tx.sign(key);
            }
        }
    }
    /**
     * loadTransactionsFromModel loads new unsigned transactions from the model into the transactions array.
     * Note: For External Address model since tx signing and broadcast status happens by the end user and not our backend
     * we need to be careful to not overwrite the transactions array with the response from the API. Ex: End user could have used
     * stakingOperation.sign() method to sign the transactions, and we should not overwrite them with the response from the API.
     * This however is ok to do so for the Wallet Address model since the transactions states are maintained by our backend.
     * This method attempts to be safe for both address models, and only adds newly created unsigned transactions that are not
     *  already in the transactions array.
     */
    loadTransactionsFromModel() {
        // Only overwrite the transactions if the response is populated.
        if (this.model.transactions && this.model.transactions.length > 0) {
            // Create a set of existing unsigned payloads to avoid duplicates.
            const existingUnsignedPayloads = new Set(this.transactions.map(tx => tx.getUnsignedPayload()));
            // Add transactions that are not already in the transactions array.
            this.model.transactions.forEach(transaction => {
                if (!existingUnsignedPayloads.has(transaction.unsigned_payload)) {
                    this.transactions.push(new transaction_1.Transaction(transaction));
                }
            });
        }
    }
}
exports.StakingOperation = StakingOperation;
/**
 * A builder class for creating execution layer withdrawal options.
 */
class ExecutionLayerWithdrawalOptionsBuilder {
    /**
     * Creates an instance of ExecutionLayerWithdrawalOptionsBuilder.
     *
     * @param networkId - The network ID.
     */
    constructor(networkId) {
        this.validatorAmounts = {};
        this.networkId = networkId;
    }
    /**
     * Adds a validator withdrawal with the specified public key and amount.
     *
     * @param pubKey - The public key of the validator.
     * @param amount - The amount to withdraw.
     */
    addValidatorWithdrawal(pubKey, amount) {
        this.validatorAmounts[pubKey] = amount;
    }
    /**
     * Builds the execution layer withdrawal options.
     *
     * @param options - Existing options to merge with the built options.
     * @returns A promise that resolves to an object containing the execution layer withdrawal options merged with any provided options.
     */
    async build(options = {}) {
        const asset = await asset_1.Asset.fetch(this.networkId, coinbase_1.Coinbase.assets.Eth);
        const validatorAmounts = {};
        for (const pubKey in this.validatorAmounts) {
            const amount = this.validatorAmounts[pubKey];
            validatorAmounts[pubKey] = asset.toAtomicAmount(new decimal_js_1.default(amount.toString())).toString();
        }
        const executionLayerWithdrawalOptions = {
            unstake_type: exports.UnstakeTypeExecution,
            validator_unstake_amounts: JSON.stringify(validatorAmounts),
        };
        return Object.assign({}, options, executionLayerWithdrawalOptions);
    }
}
exports.ExecutionLayerWithdrawalOptionsBuilder = ExecutionLayerWithdrawalOptionsBuilder;
/**
 * A builder class for creating consensus layer exit options.
 */
class ConsensusLayerExitOptionBuilder {
    constructor() {
        this.validatorPubKeys = [];
    }
    /**
     * Adds a validator public key to the list of validators.
     *
     * @param pubKey - The public key of the validator.
     */
    addValidator(pubKey) {
        if (!this.validatorPubKeys.includes(pubKey)) {
            this.validatorPubKeys.push(pubKey);
        }
    }
    /**
     * Builds the consensus layer exit options.
     *
     * @param options - Existing options to merge with the built options.
     * @returns A promise that resolves to an object containing the consensus layer exit options merged with any provided options.
     */
    async build(options = {}) {
        const consensusLayerExitOptions = {
            unstake_type: exports.UnstakeTypeConsensus,
            validator_pub_keys: this.validatorPubKeys.join(","),
        };
        return Object.assign({}, options, consensusLayerExitOptions);
    }
}
exports.ConsensusLayerExitOptionBuilder = ConsensusLayerExitOptionBuilder;
