import { ethers } from "ethers";
import { SponsoredSend as SponsoredSendModel } from "../client/api";
import { SponsoredSendStatus } from "./types";
/**
 * A representation of an onchain Sponsored Send.
 */
export declare class SponsoredSend {
    private model;
    /**
     * Sponsored Sends should be constructed via higher level abstractions like Transfer.
     *
     * @class
     * @param model - The underlying Sponsored Send object.
     */
    constructor(model: SponsoredSendModel);
    /**
     * Returns the Keccak256 hash of the typed data. This payload must be signed
     * by the sender to be used as an approval in the EIP-3009 transaction.
     *
     * @returns The Keccak256 hash of the typed data.
     */
    getTypedDataHash(): string;
    /**
     * Returns the signature of the typed data.
     *
     * @returns The hash of the typed data signature.
     */
    getSignature(): string | undefined;
    /**
     * Signs the Sponsored Send with the provided key and returns the hex signature.
     *
     * @param key - The key to sign the Sponsored Send with
     * @returns The hex-encoded signature
     */
    sign(key: ethers.Wallet): Promise<string>;
    /**
     * Returns whether the Sponsored Send has been signed.
     *
     * @returns if the Sponsored Send has been signed.
     */
    isSigned(): boolean;
    /**
     * Returns the Status of the Sponsored Send.
     *
     * @returns the Status of the Sponsored Send
     */
    getStatus(): SponsoredSendStatus | undefined;
    /**
     * Returns whether the Sponsored Send is in a terminal State.
     *
     * @returns Whether the Sponsored Send is in a terminal State
     */
    isTerminalState(): boolean;
    /**
     * Returns the Transaction Hash of the Sponsored Send.
     *
     * @returns The Transaction Hash
     */
    getTransactionHash(): string | undefined;
    /**
     * Returns the link to the Sponsored Send on the blockchain explorer.
     *
     * @returns The link to the Sponsored Send on the blockchain explorer
     */
    getTransactionLink(): string | undefined;
    /**
     * Returns a string representation of the Sponsored Send.
     *
     * @returns A string representation of the Sponsored Send
     */
    toString(): string;
}
