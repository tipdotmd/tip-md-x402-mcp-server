import { ContractEvent as ContractEventModel } from "../client";
/**
 * A representation of a single contract event.
 */
export declare class ContractEvent {
    private model;
    /**
     * Creates the ContractEvent object.
     *
     * @param model - The underlying contract event object.
     */
    constructor(model: ContractEventModel);
    /**
     * Returns the network ID of the ContractEvent.
     *
     * @returns The network ID.
     */
    networkId(): string;
    /**
     * Returns the protocol name of the ContractEvent.
     *
     * @returns The protocol name.
     */
    protocolName(): string;
    /**
     * Returns the contract name of the ContractEvent.
     *
     * @returns The contract name.
     */
    contractName(): string;
    /**
     * Returns the event name of the ContractEvent.
     *
     * @returns The event name.
     */
    eventName(): string;
    /**
     * Returns the signature of the ContractEvent.
     *
     * @returns The event signature.
     */
    sig(): string;
    /**
     * Returns the four bytes of the Keccak hash of the event signature.
     *
     * @returns The four bytes of the event signature hash.
     */
    fourBytes(): string;
    /**
     * Returns the contract address of the ContractEvent.
     *
     * @returns The contract address.
     */
    contractAddress(): string;
    /**
     * Returns the block time of the ContractEvent.
     *
     * @returns The block time.
     */
    blockTime(): Date;
    /**
     * Returns the block height of the ContractEvent.
     *
     * @returns The block height.
     */
    blockHeight(): number;
    /**
     * Returns the transaction hash of the ContractEvent.
     *
     * @returns The transaction hash.
     */
    txHash(): string;
    /**
     * Returns the transaction index of the ContractEvent.
     *
     * @returns The transaction index.
     */
    txIndex(): number;
    /**
     * Returns the event index of the ContractEvent.
     *
     * @returns The event index.
     */
    eventIndex(): number;
    /**
     * Returns the event data of the ContractEvent.
     *
     * @returns The event data.
     */
    data(): string;
    /**
     * Print the ContractEvent as a string.
     *
     * @returns The string representation of the ContractEvent.
     */
    toString(): string;
}
