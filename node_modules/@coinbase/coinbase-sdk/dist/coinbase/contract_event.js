"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractEvent = void 0;
/**
 * A representation of a single contract event.
 */
class ContractEvent {
    /**
     * Creates the ContractEvent object.
     *
     * @param model - The underlying contract event object.
     */
    constructor(model) {
        this.model = model;
    }
    /**
     * Returns the network ID of the ContractEvent.
     *
     * @returns The network ID.
     */
    networkId() {
        return this.model.network_id;
    }
    /**
     * Returns the protocol name of the ContractEvent.
     *
     * @returns The protocol name.
     */
    protocolName() {
        return this.model.protocol_name;
    }
    /**
     * Returns the contract name of the ContractEvent.
     *
     * @returns The contract name.
     */
    contractName() {
        return this.model.contract_name;
    }
    /**
     * Returns the event name of the ContractEvent.
     *
     * @returns The event name.
     */
    eventName() {
        return this.model.event_name;
    }
    /**
     * Returns the signature of the ContractEvent.
     *
     * @returns The event signature.
     */
    sig() {
        return this.model.sig;
    }
    /**
     * Returns the four bytes of the Keccak hash of the event signature.
     *
     * @returns The four bytes of the event signature hash.
     */
    fourBytes() {
        return this.model.four_bytes;
    }
    /**
     * Returns the contract address of the ContractEvent.
     *
     * @returns The contract address.
     */
    contractAddress() {
        return this.model.contract_address;
    }
    /**
     * Returns the block time of the ContractEvent.
     *
     * @returns The block time.
     */
    blockTime() {
        return new Date(this.model.block_time);
    }
    /**
     * Returns the block height of the ContractEvent.
     *
     * @returns The block height.
     */
    blockHeight() {
        return this.model.block_height;
    }
    /**
     * Returns the transaction hash of the ContractEvent.
     *
     * @returns The transaction hash.
     */
    txHash() {
        return this.model.tx_hash;
    }
    /**
     * Returns the transaction index of the ContractEvent.
     *
     * @returns The transaction index.
     */
    txIndex() {
        return this.model.tx_index;
    }
    /**
     * Returns the event index of the ContractEvent.
     *
     * @returns The event index.
     */
    eventIndex() {
        return this.model.event_index;
    }
    /**
     * Returns the event data of the ContractEvent.
     *
     * @returns The event data.
     */
    data() {
        return this.model.data;
    }
    /**
     * Print the ContractEvent as a string.
     *
     * @returns The string representation of the ContractEvent.
     */
    toString() {
        return `ContractEvent { networkId: '${this.networkId()}' protocolName: '${this.protocolName()}' contractName: '${this.contractName()}' eventName: '${this.eventName()}' contractAddress: '${this.contractAddress()}' blockHeight: ${this.blockHeight()} txHash: '${this.txHash()}' }`;
    }
}
exports.ContractEvent = ContractEvent;
