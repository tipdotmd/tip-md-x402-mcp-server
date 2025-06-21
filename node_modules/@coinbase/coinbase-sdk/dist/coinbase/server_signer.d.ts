/**
 * A representation of a Server-Signer. Server-Signers are assigned to sign transactions for a Wallet.
 */
export declare class ServerSigner {
    private model;
    /**
     * Private constructor to prevent direct instantiation outside of factory method.
     * Creates a new ServerSigner instance.
     * Do not use this method directly. Instead, use ServerSigner.getDefault().
     *
     * @ignore
     * @param serverSignerModel - The Server-Signer model.
     * @hideconstructor
     */
    private constructor();
    /**
     * Returns the default Server-Signer for the CDP Project.
     *
     * @returns The default Server-Signer.
     * @throws {APIError} if the API request to list Server-Signers fails.
     * @throws {Error} if there is no Server-Signer associated with the CDP Project.
     */
    static getDefault(): Promise<ServerSigner>;
    /**
     * Returns the ID of the Server-Signer.
     *
     * @returns The Server-Signer ID.
     */
    getId(): string;
    /**
     * Returns the IDs of the Wallet's the Server-Signer can sign for.
     *
     * @returns The Wallet IDs.
     */
    getWallets(): string[] | undefined;
    /**
     * Returns a String representation of the Server-Signer.
     *
     * @returns a String representation of the Server-Signer.
     */
    toString(): string;
}
