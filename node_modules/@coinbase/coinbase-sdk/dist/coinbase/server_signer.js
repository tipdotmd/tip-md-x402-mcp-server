"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSigner = void 0;
const coinbase_1 = require("./coinbase");
/**
 * A representation of a Server-Signer. Server-Signers are assigned to sign transactions for a Wallet.
 */
class ServerSigner {
    /**
     * Private constructor to prevent direct instantiation outside of factory method.
     * Creates a new ServerSigner instance.
     * Do not use this method directly. Instead, use ServerSigner.getDefault().
     *
     * @ignore
     * @param serverSignerModel - The Server-Signer model.
     * @hideconstructor
     */
    constructor(serverSignerModel) {
        this.model = serverSignerModel;
    }
    /**
     * Returns the default Server-Signer for the CDP Project.
     *
     * @returns The default Server-Signer.
     * @throws {APIError} if the API request to list Server-Signers fails.
     * @throws {Error} if there is no Server-Signer associated with the CDP Project.
     */
    static async getDefault() {
        const response = await coinbase_1.Coinbase.apiClients.serverSigner.listServerSigners();
        if (response.data.data.length === 0) {
            throw new Error("No Server-Signer is associated with the project");
        }
        return new ServerSigner(response.data.data[0]);
    }
    /**
     * Returns the ID of the Server-Signer.
     *
     * @returns The Server-Signer ID.
     */
    getId() {
        return this.model.server_signer_id;
    }
    /**
     * Returns the IDs of the Wallet's the Server-Signer can sign for.
     *
     * @returns The Wallet IDs.
     */
    getWallets() {
        return this.model.wallets;
    }
    /**
     * Returns a String representation of the Server-Signer.
     *
     * @returns a String representation of the Server-Signer.
     */
    toString() {
        return `ServerSigner{id: '${this.getId()}', wallets: '${this.getWallets()}'}`;
    }
}
exports.ServerSigner = ServerSigner;
