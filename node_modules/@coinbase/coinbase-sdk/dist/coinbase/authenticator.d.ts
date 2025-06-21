import { InternalAxiosRequestConfig } from "axios";
/**
 * A class that builds JWTs for authenticating with the Coinbase Platform APIs.
 */
export declare class CoinbaseAuthenticator {
    private apiKey;
    private privateKey;
    private source;
    private sourceVersion?;
    /**
     * Initializes the Authenticator.
     *
     * @param {string} apiKey - The API key name.
     * @param {string} privateKey - The private key associated with the API key.
     * @param {string} source - The source of the request.
     * @param {string} [sourceVersion] - The version of the source.
     */
    constructor(apiKey: string, privateKey: string, source: string, sourceVersion?: string);
    /**
     * Middleware to intercept requests and add JWT to the Authorization header.
     *
     * @param {InternalAxiosRequestConfig} config - The request configuration.
     * @param {boolean} [debugging] - Flag to enable debugging.
     * @returns {Promise<InternalAxiosRequestConfig>} The modified request configuration with the Authorization header added.
     * @throws {InvalidAPIKeyFormatError} If JWT could not be built.
     */
    authenticateRequest(config: InternalAxiosRequestConfig, debugging?: boolean): Promise<InternalAxiosRequestConfig>;
    /**
     * Builds the JWT for the given API endpoint URL.
     *
     * @param {string} url - URL of the API endpoint.
     * @param {string} [method] - HTTP method of the request.
     * @returns {Promise<string>} A JWT token.
     * @throws {InvalidAPIKeyFormatError} If the private key is not in the correct format or signing fails.
     */
    buildJWT(url: string, method?: string): Promise<string>;
    /**
     * Builds a JWT using an EC key.
     *
     * @param {JWTPayload} claims - The JWT claims.
     * @param {number} now - The current timestamp (in seconds).
     * @returns {Promise<string>} A JWT token signed with an EC key.
     * @throws {InvalidAPIKeyFormatError} If the key conversion, import, or signing fails.
     */
    private buildECJWT;
    /**
     * Builds a JWT using an Ed25519 key.
     *
     * @param {JWTPayload} claims - The JWT claims.
     * @param {number} now - The current timestamp (in seconds).
     * @returns {Promise<string>} A JWT token signed with an Ed25519 key.
     * @throws {InvalidAPIKeyFormatError} If the key parsing, import, or signing fails.
     */
    private buildEdwardsJWT;
    /**
     * Extracts and verifies the PEM key from the given private key string.
     *
     * @param {string} privateKeyString - The private key string.
     * @returns {string} The original PEM key string if valid.
     * @throws {InvalidAPIKeyFormatError} If the private key string is not in the correct PEM format.
     */
    private extractPemKey;
    /**
     * Generates a random nonce for the JWT.
     *
     * @returns {string} The generated nonce.
     */
    private nonce;
    /**
     * Returns encoded correlation data including the SDK version and language.
     *
     * @returns {string} Encoded correlation data as a query string.
     */
    private getCorrelationData;
}
