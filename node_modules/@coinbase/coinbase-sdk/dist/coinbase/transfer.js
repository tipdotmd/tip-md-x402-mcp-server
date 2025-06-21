"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transfer = void 0;
const decimal_js_1 = require("decimal.js");
const types_1 = require("./types");
const transaction_1 = require("./transaction");
const sponsored_send_1 = require("./sponsored_send");
const coinbase_1 = require("./coinbase");
const utils_1 = require("./utils");
const errors_1 = require("./errors");
/**
 * A representation of a Transfer, which moves an Amount of an Asset from
 * a user-controlled Wallet to another Address. The fee is assumed to be paid
 * in the native Asset of the Network.
 */
class Transfer {
    /**
     * Private constructor to prevent direct instantiation outside of the factory methods.
     *
     * @ignore
     * @param transferModel - The Transfer model.
     * @hideconstructor
     */
    constructor(transferModel) {
        if (!transferModel) {
            throw new Error("Transfer model cannot be empty");
        }
        this.model = transferModel;
    }
    /**
     * Converts a TransferModel into a Transfer object.
     *
     * @param transferModel - The Transfer model object.
     * @returns The Transfer object.
     */
    static fromModel(transferModel) {
        return new Transfer(transferModel);
    }
    /**
     * Returns the ID of the Transfer.
     *
     * @returns The Transfer ID.
     */
    getId() {
        return this.model.transfer_id;
    }
    /**
     * Returns the Network ID of the Transfer.
     *
     * @returns The Network ID.
     */
    getNetworkId() {
        return this.model.network_id;
    }
    /**
     * Returns the Wallet ID of the Transfer.
     *
     * @returns The Wallet ID.
     */
    getWalletId() {
        return this.model.wallet_id;
    }
    /**
     * Returns the From Address ID of the Transfer.
     *
     * @returns The From Address ID.
     */
    getFromAddressId() {
        return this.model.address_id;
    }
    /**
     * Returns the Destination Address ID of the Transfer.
     *
     * @returns The Destination Address ID.
     */
    getDestinationAddressId() {
        return this.model.destination;
    }
    /**
     * Returns the Asset ID of the Transfer.
     *
     * @returns The Asset ID.
     */
    getAssetId() {
        return this.model.asset_id;
    }
    /**
     * Returns the Amount of the Transfer.
     *
     * @returns The Amount of the Asset.
     */
    getAmount() {
        const amount = new decimal_js_1.Decimal(this.model.amount);
        return amount.dividedBy(new decimal_js_1.Decimal(10).pow(this.model.asset.decimals));
    }
    /**
     * Returns the Transaction Hash of the Transfer.
     *
     * @returns The Transaction Hash as a Hex string, or undefined if not yet available.
     */
    getTransactionHash() {
        return this.getSendTransactionDelegate()?.getTransactionHash();
    }
    /**
     * Returns the Transaction of the Transfer.
     *
     * @returns The ethers.js Transaction object.
     * @throws (InvalidUnsignedPayload) If the Unsigned Payload is invalid.
     */
    getRawTransaction() {
        if (!this.getTransaction())
            return undefined;
        return this.getTransaction().rawTransaction();
    }
    /**
     * Signs the Transfer with the provided key and returns the hex signature
     * required for broadcasting the Transfer.
     *
     * @param key - The key to sign the Transfer with
     * @returns The hex-encoded signed payload
     */
    async sign(key) {
        return this.getSendTransactionDelegate().sign(key);
    }
    /**
     * Returns the Status of the Transfer.
     *
     * @returns The Status of the Transfer.
     */
    getStatus() {
        switch (this.getSendTransactionDelegate().getStatus()) {
            case types_1.TransactionStatus.PENDING:
                return types_1.TransferStatus.PENDING;
            case types_1.SponsoredSendStatus.PENDING:
                return types_1.TransferStatus.PENDING;
            case types_1.SponsoredSendStatus.SIGNED:
                return types_1.TransferStatus.PENDING;
            case types_1.TransactionStatus.BROADCAST:
                return types_1.TransferStatus.BROADCAST;
            case types_1.SponsoredSendStatus.SUBMITTED:
                return types_1.TransferStatus.BROADCAST;
            case types_1.TransactionStatus.COMPLETE:
                return types_1.TransferStatus.COMPLETE;
            case types_1.SponsoredSendStatus.COMPLETE:
                return types_1.TransferStatus.COMPLETE;
            case types_1.TransactionStatus.FAILED:
                return types_1.TransferStatus.FAILED;
            case types_1.SponsoredSendStatus.FAILED:
                return types_1.TransferStatus.FAILED;
            default:
                return undefined;
        }
    }
    /**
     * Returns the Transaction of the Transfer.
     *
     * @returns The Transaction
     */
    getTransaction() {
        if (!this.model.transaction)
            return undefined;
        return new transaction_1.Transaction(this.model.transaction);
    }
    /**
     * Returns the Sponsored Send of the Transfer.
     *
     * @returns The Sponsored Send
     */
    getSponsoredSend() {
        if (!this.model.sponsored_send)
            return undefined;
        return new sponsored_send_1.SponsoredSend(this.model.sponsored_send);
    }
    /**
     * Returns the Send Transaction Delegate of the Transfer.
     *
     * @returns Either the Transaction or the Sponsored Send
     */
    getSendTransactionDelegate() {
        return !this.getTransaction() ? this.getSponsoredSend() : this.getTransaction();
    }
    /**
     * Returns the link to the Transaction on the blockchain explorer.
     *
     * @returns The link to the Transaction on the blockchain explorer.
     */
    getTransactionLink() {
        return this.getSendTransactionDelegate()?.getTransactionLink();
    }
    /**
     * Broadcasts the Transfer to the Network.
     *
     * @returns The Transfer object
     * @throws {APIError} if the API request to broadcast a Transfer fails.
     */
    async broadcast() {
        if (!this.getSendTransactionDelegate()?.isSigned())
            throw new Error("Cannot broadcast unsigned Transfer");
        const broadcastTransferRequest = {
            signed_payload: this.getSendTransactionDelegate().getSignature(),
        };
        const response = await coinbase_1.Coinbase.apiClients.transfer.broadcastTransfer(this.getWalletId(), this.getFromAddressId(), this.getId(), broadcastTransferRequest);
        return Transfer.fromModel(response.data);
    }
    /**
     * Waits for the Transfer to be confirmed on the Network or fail on chain.
     * Waits until the Transfer is completed or failed on-chain by polling at the given interval.
     * Raises an error if the Trade takes longer than the given timeout.
     *
     * @param options - The options to configure the wait function.
     * @param options.intervalSeconds - The interval to check the status of the Transfer.
     * @param options.timeoutSeconds - The maximum time to wait for the Transfer to be confirmed.
     *
     * @returns The Transfer object in a terminal state.
     * @throws {Error} if the Transfer times out.
     */
    async wait({ intervalSeconds = 0.2, timeoutSeconds = 10 } = {}) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutSeconds * 1000) {
            await this.reload();
            // If the Transfer is in a terminal state, return the Transfer.
            const status = this.getStatus();
            if (status === types_1.TransferStatus.COMPLETE || status === types_1.TransferStatus.FAILED) {
                return this;
            }
            await (0, utils_1.delay)(intervalSeconds);
        }
        throw new errors_1.TimeoutError("Transfer timed out");
    }
    /**
     * Reloads the Transfer model with the latest data from the server.
     *
     * @throws {APIError} if the API request to get a Transfer fails.
     */
    async reload() {
        const result = await coinbase_1.Coinbase.apiClients.transfer.getTransfer(this.getWalletId(), this.getFromAddressId(), this.getId());
        this.model = result?.data;
    }
    /**
     * Returns a string representation of the Transfer.
     *
     * @returns The string representation of the Transfer.
     */
    toString() {
        return (`Transfer{transferId: '${this.getId()}', networkId: '${this.getNetworkId()}', ` +
            `fromAddressId: '${this.getFromAddressId()}', destinationAddressId: '${this.getDestinationAddressId()}', ` +
            `assetId: '${this.getAssetId()}', amount: '${this.getAmount()}', transactionHash: '${this.getTransactionHash()}', ` +
            `transactionLink: '${this.getTransactionLink()}', status: '${this.getStatus()}'}`);
    }
}
exports.Transfer = Transfer;
