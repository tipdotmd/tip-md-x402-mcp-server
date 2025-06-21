"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractInvocation = void 0;
const decimal_js_1 = require("decimal.js");
const types_1 = require("./types");
const transaction_1 = require("./transaction");
const coinbase_1 = require("./coinbase");
const utils_1 = require("./utils");
const errors_1 = require("./errors");
/**
 * A representation of a ContractInvocation, which calls a smart contract method
 * onchain. The fee is assumed to be paid in the native Asset of the Network.
 */
class ContractInvocation {
    /**
     * Private constructor to prevent direct instantiation outside of the factory methods.
     *
     * @ignore
     * @param contractInvocationModel - The ContractInvocation model.
     * @hideconstructor
     */
    constructor(contractInvocationModel) {
        if (!contractInvocationModel) {
            throw new Error("ContractInvocation model cannot be empty");
        }
        this.model = contractInvocationModel;
    }
    /**
     * Converts a ContractInvocationModel into a ContractInvocation object.
     *
     * @param contractInvocationModel - The ContractInvocation model object.
     * @returns The ContractInvocation object.
     */
    static fromModel(contractInvocationModel) {
        return new ContractInvocation(contractInvocationModel);
    }
    /**
     * Returns the ID of the ContractInvocation.
     *
     * @returns The ContractInvocation ID.
     */
    getId() {
        return this.model.contract_invocation_id;
    }
    /**
     * Returns the Network ID of the ContractInvocation.
     *
     * @returns The Network ID.
     */
    getNetworkId() {
        return this.model.network_id;
    }
    /**
     * Returns the Wallet ID of the ContractInvocation.
     *
     * @returns The Wallet ID.
     */
    getWalletId() {
        return this.model.wallet_id;
    }
    /**
     * Returns the From Address ID of the ContractInvocation.
     *
     * @returns The From Address ID.
     */
    getFromAddressId() {
        return this.model.address_id;
    }
    /**
     * Returns the Destination Address ID of the ContractInvocation.
     *
     * @returns The Destination Address ID.
     */
    getContractAddressId() {
        return this.model.contract_address;
    }
    /**
     * Returns the Method of the ContractInvocation.
     *
     * @returns The Method.
     */
    getMethod() {
        return this.model.method;
    }
    /**
     * Returns the Arguments of the ContractInvocation.
     *
     * @returns {object} The arguments object passed to the contract invocation.
     * The key is the argument name and the value is the argument value.
     */
    getArgs() {
        return JSON.parse(this.model.args);
    }
    /**
     * Returns the ABI of the ContractInvocation, if specified.
     *
     * @returns The ABI as an object, or undefined if not available.
     */
    getAbi() {
        if (!this.model.abi)
            return undefined;
        return JSON.parse(this.model.abi);
    }
    /**
     * Returns the amount of the native asset sent to a payable contract method, if applicable.
     *
     * @returns The amount in atomic units of the native asset.
     */
    getAmount() {
        return new decimal_js_1.Decimal(this.model.amount);
    }
    /**
     * Returns the Transaction Hash of the ContractInvocation.
     *
     * @returns The Transaction Hash as a Hex string, or undefined if not yet available.
     */
    getTransactionHash() {
        return this.getTransaction().getTransactionHash();
    }
    /**
     * Returns the Transaction of the ContractInvocation.
     *
     * @returns The ethers.js Transaction object.
     * @throws (InvalidUnsignedPayload) If the Unsigned Payload is invalid.
     */
    getRawTransaction() {
        return this.getTransaction().rawTransaction();
    }
    /**
     * Signs the ContractInvocation with the provided key and returns the hex signature
     * required for broadcasting the ContractInvocation.
     *
     * @param key - The key to sign the ContractInvocation with
     * @returns The hex-encoded signed payload
     */
    async sign(key) {
        return this.getTransaction().sign(key);
    }
    /**
     * Returns the Status of the ContractInvocation.
     *
     * @returns The Status of the ContractInvocation.
     */
    getStatus() {
        return this.getTransaction().getStatus();
    }
    /**
     * Returns the Transaction of the ContractInvocation.
     *
     * @returns The Transaction
     */
    getTransaction() {
        return new transaction_1.Transaction(this.model.transaction);
    }
    /**
     * Returns the link to the Transaction on the blockchain explorer.
     *
     * @returns The link to the Transaction on the blockchain explorer.
     */
    getTransactionLink() {
        return this.getTransaction().getTransactionLink();
    }
    /**
     * Broadcasts the ContractInvocation to the Network.
     *
     * @returns The ContractInvocation object
     * @throws {APIError} if the API request to broadcast a ContractInvocation fails.
     */
    async broadcast() {
        if (!this.getTransaction()?.isSigned())
            throw new Error("Cannot broadcast unsigned ContractInvocation");
        const broadcastContractInvocationRequest = {
            signed_payload: this.getTransaction().getSignature(),
        };
        const response = await coinbase_1.Coinbase.apiClients.contractInvocation.broadcastContractInvocation(this.getWalletId(), this.getFromAddressId(), this.getId(), broadcastContractInvocationRequest);
        return ContractInvocation.fromModel(response.data);
    }
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
    async wait({ intervalSeconds = 0.2, timeoutSeconds = 10, } = {}) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutSeconds * 1000) {
            await this.reload();
            // If the ContractInvocation is in a terminal state, return the ContractInvocation.
            const status = this.getStatus();
            if (status === types_1.TransactionStatus.COMPLETE || status === types_1.TransactionStatus.FAILED) {
                return this;
            }
            await (0, utils_1.delay)(intervalSeconds);
        }
        throw new errors_1.TimeoutError("ContractInvocation timed out");
    }
    /**
     * Reloads the ContractInvocation model with the latest data from the server.
     *
     * @throws {APIError} if the API request to get a ContractInvocation fails.
     */
    async reload() {
        const result = await coinbase_1.Coinbase.apiClients.contractInvocation.getContractInvocation(this.getWalletId(), this.getFromAddressId(), this.getId());
        this.model = result?.data;
    }
    /**
     * Returns a string representation of the ContractInvocation.
     *
     * @returns The string representation of the ContractInvocation.
     */
    toString() {
        return (`ContractInvocation{contractInvocationId: '${this.getId()}', networkId: '${this.getNetworkId()}', ` +
            `fromAddressId: '${this.getFromAddressId()}', contractAddressId: '${this.getContractAddressId()}', ` +
            `method: '${this.getMethod()}', args: '${this.getArgs()}', transactionHash: '${this.getTransactionHash()}', ` +
            `transactionLink: '${this.getTransactionLink()}', status: '${this.getStatus()}'}`);
    }
}
exports.ContractInvocation = ContractInvocation;
