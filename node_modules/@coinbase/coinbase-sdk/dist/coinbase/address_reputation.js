"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressReputation = void 0;
/**
 * A representation of the reputation of a blockchain address.
 */
class AddressReputation {
    /**
     * A representation of the reputation of a blockchain address.
     *
     * @param {AddressReputationModel} model - The reputation model instance.
     */
    constructor(model) {
        if (!model) {
            throw new Error("Address reputation model cannot be empty");
        }
        this.model = model;
    }
    /**
     * Returns the address ID.
     *
     * @returns {string} The address ID.
     */
    get risky() {
        return this.model.score < 0;
    }
    /**
     * Returns the score of the address.
     * The score is a number between -100 and 100.
     *
     * @returns {number} The score of the address.
     */
    get score() {
        return this.model.score;
    }
    /**
     * Returns the metadata of the address reputation.
     * The metadata contains additional information about the address reputation.
     *
     * @returns {AddressReputationMetadata} The metadata of the address reputation.
     */
    get metadata() {
        return this.model.metadata;
    }
    /**
     * Returns the address ID.
     *
     * @returns {string} The address ID.
     */
    toString() {
        const metadata = Object.entries(this.model.metadata).map(([key, value]) => {
            return `${key}: ${value}`;
        });
        return `AddressReputation(score: ${this.score}, metadata: {${metadata.join(", ")}})`;
    }
}
exports.AddressReputation = AddressReputation;
