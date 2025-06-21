"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaucetTransaction = void 0;
const coinbase_1 = require("./coinbase");
const transaction_1 = require("./transaction");
const utils_1 = require("./utils");
const errors_1 = require("./errors");
/**
 * Represents a transaction from a faucet.
 */
class FaucetTransaction {
    /**
     * Creates a new FaucetTransaction instance.
     * Do not use this method directly - instead, use Address.faucet().
     *
     * @class
     * @param {FaucetTransactionModel} model - The FaucetTransaction model.
     * @throws {Error} If the model does not exist.
     */
    constructor(model) {
        if (!model?.transaction) {
            throw new Error("FaucetTransaction model cannot be empty");
        }
        this.model = model;
        this._transaction = new transaction_1.Transaction(this.model.transaction);
    }
    /**
     * Returns the Transaction of the FaucetTransaction.
     *
     * @returns The Faucet Transaction
     */
    get transaction() {
        return this._transaction;
    }
    /**
     * Returns the transaction hash.
     *
     * @returns {string} The transaction hash.
     */
    getTransactionHash() {
        return this.transaction.getTransactionHash();
    }
    /**
     * Returns the link to the transaction on the blockchain explorer.
     *
     * @returns {string} The link to the transaction on the blockchain explorer
     */
    getTransactionLink() {
        return this.transaction.getTransactionLink();
    }
    /**
     * Returns the Status of the FaucetTransaction.
     *
     * @returns The Status of the FaucetTransaction.
     */
    getStatus() {
        return this.transaction.getStatus();
    }
    /**
     * Returns the network ID of the FaucetTransaction.
     *
     * @returns {string} The network ID.
     */
    getNetworkId() {
        return this.transaction.getNetworkId();
    }
    /**
     * Returns the address that is being funded by the faucet.
     *
     * @returns {string} The address ID.
     */
    getAddressId() {
        return this.transaction.toAddressId();
    }
    /**
     * Waits for the FaucetTransaction to be confirmed on the Network or fail on chain.
     * Waits until the FaucetTransaction is completed or failed on-chain by polling at the given interval.
     * Raises an error if the FaucetTransaction takes longer than the given timeout.
     *
     * @param options - The options to configure the wait function.
     * @param options.intervalSeconds - The interval to check the status of the FaucetTransaction.
     * @param options.timeoutSeconds - The maximum time to wait for the FaucetTransaction to be confirmed.
     *
     * @returns The FaucetTransaction object in a terminal state.
     * @throws {Error} if the FaucetTransaction times out.
     */
    async wait({ intervalSeconds = 0.2, timeoutSeconds = 10, } = {}) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutSeconds * 1000) {
            await this.reload();
            // If the FaucetTransaction is in a terminal state, return the FaucetTransaction.
            if (this.transaction.isTerminalState()) {
                return this;
            }
            await (0, utils_1.delay)(intervalSeconds);
        }
        throw new errors_1.TimeoutError("FaucetTransaction timed out");
    }
    /**
     * Reloads the FaucetTransaction model with the latest data from the server.
     *
     * @returns {FaucetTransaction} The reloaded FaucetTransaction object.
     * @throws {APIError} if the API request to get a FaucetTransaction fails.
     */
    async reload() {
        const result = await coinbase_1.Coinbase.apiClients.externalAddress.getFaucetTransaction(this.transaction.getNetworkId(), this.getAddressId(), this.getTransactionHash());
        this.model = result?.data;
        if (!this.model?.transaction) {
            throw new Error("FaucetTransaction model cannot be empty");
        }
        this._transaction = new transaction_1.Transaction(this.model.transaction);
        return this;
    }
    /**
     * Returns a string representation of the FaucetTransaction.
     *
     * @returns {string} A string representation of the FaucetTransaction.
     */
    toString() {
        return `Coinbase::FaucetTransaction{transaction_hash: '${this.getTransactionHash()}', transaction_link: '${this.getTransactionLink()}'}`;
    }
}
exports.FaucetTransaction = FaucetTransaction;
