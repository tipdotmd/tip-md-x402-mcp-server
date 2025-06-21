"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validator = void 0;
const coinbase_1 = require("./coinbase");
const api_1 = require("../client/api");
const types_1 = require("./types");
/**
 * A representation of a validator onchain.
 */
class Validator {
    /**
     * Creates a Validator object.
     *
     * @class
     * @param model - The underlying Validator object.
     * @throws {Error} - If the Validator model is empty.
     */
    constructor(model) {
        if (!model) {
            throw new Error("Invalid model type");
        }
        this.model = model;
    }
    /**
     * Returns the list of Validators.
     *
     * @param networkId - The network ID.
     * @param assetId - The asset ID.
     * @param status - The status to filter by.
     * @returns The list of Validators.
     */
    static async list(networkId, assetId, status) {
        const validators = [];
        const response = await coinbase_1.Coinbase.apiClients.stake.listValidators(networkId, assetId, Validator.getAPIValidatorStatus(status));
        response.data.data.forEach(validator => {
            validators.push(new Validator(validator));
        });
        return validators;
    }
    /**
     *
     * Returns the details of a specific validator.
     *
     * @param networkId - The network ID.
     * @param assetId - The asset ID.
     * @param id - The unique publicly identifiable id of the validator for which to fetch the data.
     * @returns The requested validator details.
     */
    static async fetch(networkId, assetId, id) {
        const response = await coinbase_1.Coinbase.apiClients.stake.getValidator(networkId, assetId, id);
        return new Validator(response.data);
    }
    /**
     * Returns the Validator status.
     *
     * @param status - The API Validator status.
     * @returns The Validator status.
     */
    static getAPIValidatorStatus(status) {
        /* istanbul ignore next */
        switch (status) {
            case types_1.ValidatorStatus.UNKNOWN:
                return api_1.ValidatorStatus.Unknown;
            case types_1.ValidatorStatus.PROVISIONING:
                return api_1.ValidatorStatus.Provisioning;
            case types_1.ValidatorStatus.PROVISIONED:
                return api_1.ValidatorStatus.Provisioned;
            case types_1.ValidatorStatus.DEPOSITED:
                return api_1.ValidatorStatus.Deposited;
            case types_1.ValidatorStatus.PENDING_ACTIVATION:
                return api_1.ValidatorStatus.PendingActivation;
            case types_1.ValidatorStatus.ACTIVE:
                return api_1.ValidatorStatus.Active;
            case types_1.ValidatorStatus.EXITING:
                return api_1.ValidatorStatus.Exiting;
            case types_1.ValidatorStatus.EXITED:
                return api_1.ValidatorStatus.Exited;
            case types_1.ValidatorStatus.WITHDRAWAL_AVAILABLE:
                return api_1.ValidatorStatus.WithdrawalAvailable;
            case types_1.ValidatorStatus.WITHDRAWAL_COMPLETE:
                return api_1.ValidatorStatus.WithdrawalComplete;
            case types_1.ValidatorStatus.ACTIVE_SLASHED:
                return api_1.ValidatorStatus.ActiveSlashed;
            case types_1.ValidatorStatus.EXITED_SLASHED:
                return api_1.ValidatorStatus.ExitedSlashed;
            case types_1.ValidatorStatus.REAPED:
                return api_1.ValidatorStatus.Reaped;
            default:
                return api_1.ValidatorStatus.Unknown;
        }
    }
    /**
     * Returns the Validator ID.
     *
     * @returns The Validator ID.
     */
    getValidatorId() {
        return this.model.validator_id;
    }
    /**
     * Returns the Validator status.
     *
     * @returns The Validator status.
     */
    getStatus() {
        switch (this.model.status) {
            case api_1.ValidatorStatus.Unknown:
                return types_1.ValidatorStatus.UNKNOWN;
            case api_1.ValidatorStatus.Provisioning:
                return types_1.ValidatorStatus.PROVISIONING;
            case api_1.ValidatorStatus.Provisioned:
                return types_1.ValidatorStatus.PROVISIONED;
            case api_1.ValidatorStatus.Deposited:
                return types_1.ValidatorStatus.DEPOSITED;
            case api_1.ValidatorStatus.PendingActivation:
                return types_1.ValidatorStatus.PENDING_ACTIVATION;
            case api_1.ValidatorStatus.Active:
                return types_1.ValidatorStatus.ACTIVE;
            case api_1.ValidatorStatus.Exiting:
                return types_1.ValidatorStatus.EXITING;
            case api_1.ValidatorStatus.Exited:
                return types_1.ValidatorStatus.EXITED;
            case api_1.ValidatorStatus.WithdrawalAvailable:
                return types_1.ValidatorStatus.WITHDRAWAL_AVAILABLE;
            case api_1.ValidatorStatus.WithdrawalComplete:
                return types_1.ValidatorStatus.WITHDRAWAL_COMPLETE;
            case api_1.ValidatorStatus.ActiveSlashed:
                return types_1.ValidatorStatus.ACTIVE_SLASHED;
            case api_1.ValidatorStatus.ExitedSlashed:
                return types_1.ValidatorStatus.EXITED_SLASHED;
            case api_1.ValidatorStatus.Reaped:
                return types_1.ValidatorStatus.REAPED;
            default:
                return types_1.ValidatorStatus.UNKNOWN;
        }
    }
    /**
     * Returns the network ID.
     *
     * @returns The network ID.
     */
    getNetworkId() {
        return this.model.network_id;
    }
    /**
     * Returns the asset ID.
     *
     * @returns The asset ID.
     */
    getAssetId() {
        return this.model.asset_id;
    }
    /**
     * Returns the activation epoch of the validator.
     *
     * @returns The activation epoch as a string.
     */
    getActivationEpoch() {
        return this.model.details?.activationEpoch || "";
    }
    /**
     * Returns the balance of the validator.
     *
     * @returns The balance object.
     */
    getBalance() {
        return this.model.details?.balance;
    }
    /**
     * Returns the effective balance of the validator.
     *
     * @returns The effective balance object.
     */
    getEffectiveBalance() {
        return this.model.details?.effective_balance;
    }
    /**
     * Returns the exit epoch of the validator.
     *
     * @returns The exit epoch as a string.
     */
    getExitEpoch() {
        return this.model.details?.exitEpoch || "";
    }
    /**
     * Returns the index of the validator.
     *
     * @returns The validator index as a string.
     */
    getIndex() {
        return this.model.details?.index || "";
    }
    /**
     * Returns the public key of the validator.
     *
     * @returns The validator's public key as a string.
     */
    getPublicKey() {
        return this.model.details?.public_key || "";
    }
    /**
     * Returns whether the validator has been slashed.
     *
     * @returns True if the validator has been slashed, false otherwise.
     */
    isSlashed() {
        return this.model.details?.slashed || false;
    }
    /**
     * Returns the withdrawable epoch of the validator.
     *
     * @returns The withdrawable epoch as a string.
     */
    getWithdrawableEpoch() {
        return this.model.details?.withdrawableEpoch || "";
    }
    /**
     * Returns the withdrawal address of the validator.
     *
     * @returns The withdrawal address as a string.
     */
    getWithdrawalAddress() {
        return this.model.details?.withdrawal_address || "";
    }
    /**
     * Returns the withdrawal credentials of the validator.
     *
     * @returns The withdrawal credentials as a string.
     */
    getWithdrawalCredentials() {
        return this.model.details?.withdrawal_credentials || "";
    }
    /**
     * Returns the address for execution layer rewards (MEV & tx fees).If using a reward splitter plan, this is a smart contract
     * address that splits rewards based on defined commissions and send a portion to the forwarded_fee_recipient_address.
     *
     * @returns The fee recipient address as a string.
     */
    getFeeRecipientAddress() {
        return this.model.details?.fee_recipient_address || "";
    }
    /**
     * If using a reward splitter plan, this address receives a defined percentage of the total execution layer rewards.
     *
     * @returns The forwarded fee recipient address as a string.
     */
    getForwardedFeeRecipientAddress() {
        return this.model.details?.forwarded_fee_recipient_address || "";
    }
    /**
     * Returns the string representation of the Validator.
     *
     * @returns The string representation of the Validator.
     */
    toString() {
        return `Id: ${this.getValidatorId()} Status: ${this.getStatus()}`;
    }
    /**
     * Returns the JSON representation of the Validator.
     *
     * @returns The JSON representation of the Validator.
     */
    toJSON() {
        return JSON.stringify(this.model);
    }
}
exports.Validator = Validator;
