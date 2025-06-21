import { AddressReputation as AddressReputationModel, AddressReputationMetadata } from "../client";
/**
 * A representation of the reputation of a blockchain address.
 */
export declare class AddressReputation {
    private model;
    /**
     * A representation of the reputation of a blockchain address.
     *
     * @param {AddressReputationModel} model - The reputation model instance.
     */
    constructor(model: AddressReputationModel);
    /**
     * Returns the address ID.
     *
     * @returns {string} The address ID.
     */
    get risky(): boolean;
    /**
     * Returns the score of the address.
     * The score is a number between -100 and 100.
     *
     * @returns {number} The score of the address.
     */
    get score(): number;
    /**
     * Returns the metadata of the address reputation.
     * The metadata contains additional information about the address reputation.
     *
     * @returns {AddressReputationMetadata} The metadata of the address reputation.
     */
    get metadata(): AddressReputationMetadata;
    /**
     * Returns the address ID.
     *
     * @returns {string} The address ID.
     */
    toString(): string;
}
