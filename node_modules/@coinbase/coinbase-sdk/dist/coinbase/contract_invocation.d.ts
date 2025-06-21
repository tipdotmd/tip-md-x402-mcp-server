import { Decimal } from "decimal.js";
import { TransactionStatus } from "./types";
import { Transaction } from "./transaction";
import { ContractInvocation as ContractInvocationModel } from "../client/api";
import { ethers } from "ethers";
/**
 * A representation of a ContractInvocation, which calls a smart contract method
 * onchain. The fee is assumed to be paid in the native Asset of the Network.
 */
export declare class ContractInvocation {
    private model;
    /**
     * Private constructor to prevent direct instantiation outside of the factory methods.
     *
     * @ignore
     * @param contractInvocationModel - The ContractInvocation model.
     * @hideconstructor
     */
    private constructor();
    /**
     * Converts a ContractInvocationModel into a ContractInvocation object.
     *
     * @param contractInvocationModel - The ContractInvocation model object.
     * @returns The ContractInvocation object.
     */
    static fromModel(contractInvocationModel: ContractInvocationModel): ContractInvocation;
    /**
     * Returns the ID of the ContractInvocation.
     *
     * @returns The ContractInvocation ID.
     */
    getId(): string;
    /**
     * Returns the Network ID of the ContractInvocation.
     *
     * @returns The Network ID.
     */
    getNetworkId(): string;
    /**
     * Returns the Wallet ID of the ContractInvocation.
     *
     * @returns The Wallet ID.
     */
    getWalletId(): string;
    /**
     * Returns the From Address ID of the ContractInvocation.
     *
     * @returns The From Address ID.
     */
    getFromAddressId(): string;
    /**
     * Returns the Destination Address ID of the ContractInvocation.
     *
     * @returns The Destination Address ID.
     */
    getContractAddressId(): string;
    /**
     * Returns the Method of the ContractInvocation.
     *
     * @returns The Method.
     */
    getMethod(): string;
    /**
     * Returns the Arguments of the ContractInvocation.
     *
     * @returns {object} The arguments object passed to the contract invocation.
     * The key is the argument name and the value is the argument value.
     */
    getArgs(): object;
    /**
     * Returns the ABI of the ContractInvocation, if specified.
     *
     * @returns The ABI as an object, or undefined if not available.
     */
    getAbi(): object | undefined;
    /**
     * Returns the amount of the native asset sent to a payable contract method, if applicable.
     *
     * @returns The amount in atomic units of the native asset.
     */
    getAmount(): Decimal;
    /**
     * Returns the Transaction Hash of the ContractInvocation.
     *
     * @returns The Transaction Hash as a Hex string, or undefined if not yet available.
     */
    getTransactionHash(): string | undefined;
    /**
     * Returns the Transaction of the ContractInvocation.
     *
     * @returns The ethers.js Transaction object.
     * @throws (InvalidUnsignedPayload) If the Unsigned Payload is invalid.
     */
    getRawTransaction(): ethers.Transaction;
    /**
     * Signs the ContractInvocation with the provided key and returns the hex signature
     * required for broadcasting the ContractInvocation.
     *
     * @param key - The key to sign the ContractInvocation with
     * @returns The hex-encoded signed payload
     */
    sign(key: ethers.Wallet): Promise<string>;
    /**
     * Returns the Status of the ContractInvocation.
     *
     * @returns The Status of the ContractInvocation.
     */
    getStatus(): TransactionStatus | undefined;
    /**
     * Returns the Transaction of the ContractInvocation.
     *
     * @returns The Transaction
     */
    getTransaction(): Transaction;
    /**
     * Returns the link to the Transaction on the blockchain explorer.
     *
     * @returns The link to the Transaction on the blockchain explorer.
     */
    getTransactionLink(): string;
    /**
     * Broadcasts the ContractInvocation to the Network.
     *
     * @returns The ContractInvocation object
     * @throws {APIError} if the API request to broadcast a ContractInvocation fails.
     */
    broadcast(): Promise<ContractInvocation>;
    /**
     * Waits for the ContractInvocation to be confirmed on the Network or fail on chain.
     * Waits until the ContractInvocation is completed or failed on-chain by polling at the given interval.
     * Raises an error if the ContractInvocation takes longer than the given timeout.
     *
     * @param options - The options to configure the wait function.
     * @param options.intervalSeconds - The interval to check the status of the ContractInvocation.
     * @param options.timeoutSeconds - The maximum time to wait for the ContractInvocation to be confirmed.
     *
     * @returns The ContractInvocation object in a terminal state.
     * @throws {Error} if the ContractInvocation times out.
     */
    wait({ intervalSeconds, timeoutSeconds, }?: {
        intervalSeconds?: number | undefined;
        timeoutSeconds?: number | undefined;
    }): Promise<ContractInvocation>;
    /**
     * Reloads the ContractInvocation model with the latest data from the server.
     *
     * @throws {APIError} if the API request to get a ContractInvocation fails.
     */
    reload(): Promise<void>;
    /**
     * Returns a string representation of the ContractInvocation.
     *
     * @returns The string representation of the ContractInvocation.
     */
    toString(): string;
}
