import { Balance, Validator as ValidatorModel } from "../client/api";
import { ValidatorStatus } from "./types";
/**
 * A representation of a validator onchain.
 */
export declare class Validator {
    private model;
    /**
     * Creates a Validator object.
     *
     * @class
     * @param model - The underlying Validator object.
     * @throws {Error} - If the Validator model is empty.
     */
    constructor(model: ValidatorModel);
    /**
     * Returns the list of Validators.
     *
     * @param networkId - The network ID.
     * @param assetId - The asset ID.
     * @param status - The status to filter by.
     * @returns The list of Validators.
     */
    static list(networkId: string, assetId: string, status?: ValidatorStatus): Promise<Validator[]>;
    /**
     *
     * Returns the details of a specific validator.
     *
     * @param networkId - The network ID.
     * @param assetId - The asset ID.
     * @param id - The unique publicly identifiable id of the validator for which to fetch the data.
     * @returns The requested validator details.
     */
    static fetch(networkId: string, assetId: string, id: string): Promise<Validator>;
    /**
     * Returns the Validator status.
     *
     * @param status - The API Validator status.
     * @returns The Validator status.
     */
    private static getAPIValidatorStatus;
    /**
     * Returns the Validator ID.
     *
     * @returns The Validator ID.
     */
    getValidatorId(): string;
    /**
     * Returns the Validator status.
     *
     * @returns The Validator status.
     */
    getStatus(): string;
    /**
     * Returns the network ID.
     *
     * @returns The network ID.
     */
    getNetworkId(): string;
    /**
     * Returns the asset ID.
     *
     * @returns The asset ID.
     */
    getAssetId(): string;
    /**
     * Returns the activation epoch of the validator.
     *
     * @returns The activation epoch as a string.
     */
    getActivationEpoch(): string;
    /**
     * Returns the balance of the validator.
     *
     * @returns The balance object.
     */
    getBalance(): Balance | undefined;
    /**
     * Returns the effective balance of the validator.
     *
     * @returns The effective balance object.
     */
    getEffectiveBalance(): Balance | undefined;
    /**
     * Returns the exit epoch of the validator.
     *
     * @returns The exit epoch as a string.
     */
    getExitEpoch(): string;
    /**
     * Returns the index of the validator.
     *
     * @returns The validator index as a string.
     */
    getIndex(): string;
    /**
     * Returns the public key of the validator.
     *
     * @returns The validator's public key as a string.
     */
    getPublicKey(): string;
    /**
     * Returns whether the validator has been slashed.
     *
     * @returns True if the validator has been slashed, false otherwise.
     */
    isSlashed(): boolean;
    /**
     * Returns the withdrawable epoch of the validator.
     *
     * @returns The withdrawable epoch as a string.
     */
    getWithdrawableEpoch(): string;
    /**
     * Returns the withdrawal address of the validator.
     *
     * @returns The withdrawal address as a string.
     */
    getWithdrawalAddress(): string;
    /**
     * Returns the withdrawal credentials of the validator.
     *
     * @returns The withdrawal credentials as a string.
     */
    getWithdrawalCredentials(): string;
    /**
     * Returns the address for execution layer rewards (MEV & tx fees).If using a reward splitter plan, this is a smart contract
     * address that splits rewards based on defined commissions and send a portion to the forwarded_fee_recipient_address.
     *
     * @returns The fee recipient address as a string.
     */
    getFeeRecipientAddress(): string;
    /**
     * If using a reward splitter plan, this address receives a defined percentage of the total execution layer rewards.
     *
     * @returns The forwarded fee recipient address as a string.
     */
    getForwardedFeeRecipientAddress(): string;
    /**
     * Returns the string representation of the Validator.
     *
     * @returns The string representation of the Validator.
     */
    toString(): string;
    /**
     * Returns the JSON representation of the Validator.
     *
     * @returns The JSON representation of the Validator.
     */
    toJSON(): string;
}
