import { PayloadSignature as PayloadSignatureModel } from "../client";
import { PayloadSignatureStatus } from "./types";
/**
 * A representation of a Payload Signature.
 */
export declare class PayloadSignature {
    private model;
    /**
     * Constructs a Payload Signature.
     *
     * @class
     * @param model - The underlying Payload Signature object.
     */
    constructor(model: PayloadSignatureModel);
    /**
     * Returns the ID of the Payload Signature.
     *
     * @returns The ID of the Payload Signature
     */
    getId(): string;
    /**
     * Returns the Wallet ID of the Payload Signature.
     *
     * @returns The Wallet ID
     */
    getWalletId(): string;
    /**
     * Returns the Address ID of the Payload Signature.
     *
     * @returns The Address ID
     */
    getAddressId(): string;
    /**
     * Returns the Unsigned Payload of the Payload Signature.
     *
     * @returns The Unsigned Payload
     */
    getUnsignedPayload(): string;
    /**
     * Returns the Signature of the Payload Signature.
     *
     * @returns The Signature
     */
    getSignature(): string | undefined;
    /**
     * Returns the Status of the Payload Signature.
     *
     * @returns The Status
     */
    getStatus(): PayloadSignatureStatus | undefined;
    /**
     * Returns whether the Payload Signature is in a terminal State.
     *
     * @returns Whether the Payload Signature is in a terminal State
     */
    isTerminalState(): boolean;
    /**
     * Waits for the Payload Signature to be signed or for the signature operation to fail.
     *
     * @param options - The options to configure the wait function.
     * @param options.intervalSeconds - The interval to check the status of the Payload Signature.
     * @param options.timeoutSeconds - The maximum time to wait for the Payload Signature to be confirmed.
     *
     * @returns The Payload Signature object in a terminal state.
     * @throws {Error} if the Payload Signature times out.
     */
    wait({ intervalSeconds, timeoutSeconds, }?: {
        intervalSeconds?: number | undefined;
        timeoutSeconds?: number | undefined;
    }): Promise<PayloadSignature>;
    /**
     * Reloads the Payload Signature model with the latest data from the server.
     *
     * @throws {APIError} if the API request to get a Payload Signature fails.
     */
    reload(): Promise<void>;
    /**
     * Returns a string representation of the Payload Signature.
     *
     * @returns A string representation of the Payload Signature.
     */
    toString(): string;
}
