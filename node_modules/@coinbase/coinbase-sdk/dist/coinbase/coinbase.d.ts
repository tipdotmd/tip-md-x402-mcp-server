import { ApiClients, CoinbaseConfigureFromJsonOptions, CoinbaseOptions } from "./types";
/**
 * The Coinbase SDK.
 */
export declare class Coinbase {
    /**
     * The map of supported networks to network ID. Generated from the OpenAPI spec.
     *
     * @constant
     *
     * @example
     * ```typescript
     * Coinbase.networks.BaseMainnet
     * ```
     */
    static networks: {
        readonly BaseSepolia: "base-sepolia";
        readonly BaseMainnet: "base-mainnet";
        readonly EthereumHoodi: "ethereum-hoodi";
        readonly EthereumSepolia: "ethereum-sepolia";
        readonly EthereumMainnet: "ethereum-mainnet";
        readonly PolygonMainnet: "polygon-mainnet";
        readonly SolanaDevnet: "solana-devnet";
        readonly SolanaMainnet: "solana-mainnet";
        readonly ArbitrumMainnet: "arbitrum-mainnet";
        readonly ArbitrumSepolia: "arbitrum-sepolia";
        readonly BitcoinMainnet: "bitcoin-mainnet";
        readonly NearTestnet: "near-testnet";
        readonly NearMainnet: "near-mainnet";
    };
    /**
     * The list of supported assets.
     *
     * @constant
     */
    static assets: {
        Eth: string;
        Wei: string;
        Gwei: string;
        Usdc: string;
        Weth: string;
        Sol: string;
        Lamport: string;
        Eurc: string;
        Cbbtc: string;
    };
    static apiClients: ApiClients;
    /**
     * The CDP API key Private Key.
     *
     * @constant
     */
    static apiKeyPrivateKey: string;
    /**
     * Whether to use a server signer or not.
     *
     * @constant
     */
    static useServerSigner: boolean;
    /**
     * The default page limit for list methods.
     *
     * @constant
     */
    static defaultPageLimit: number;
    /**
     * Initializes the Coinbase SDK.
     *
     * @deprecated as of v0.5.0, use `configure` or `configureFromJson` instead.
     *
     * @class
     * @param options - The constructor options.
     * @param options.apiKeyName - The API key name.
     * @param options.privateKey - The private key associated with the API key.
     * @param options.useServerSigner - Whether to use a Server-Signer or not.
     * @param options.debugging - If true, logs API requests and responses to the console.
     * @param options.basePath - The base path for the API.
     * @param options.maxNetworkRetries - The maximum number of network retries for the API GET requests.
     * @param options.source - Optional source string to be sent with the API requests. Defaults to `sdk`.
     * @param options.sourceVersion - Optional source version string to be sent with the API requests.
     * @throws {InvalidConfigurationError} If the configuration is invalid.
     * @throws {InvalidAPIKeyFormatError} If not able to create JWT token.
     */
    constructor({ apiKeyName, privateKey, useServerSigner, debugging, basePath, maxNetworkRetries, source, sourceVersion, }: CoinbaseOptions);
    /**
     * Configures the Coinbase SDK with the provided options.
     *
     * @param options - The configuration options.
     * @param options.apiKeyName - The name of the API key.
     * @param options.privateKey - The private key associated with the API key.
     * @param options.useServerSigner - Whether to use a Server-Signer or not. Defaults to false.
     * @param options.debugging - If true, logs API requests and responses to the console. Defaults to false.
     * @param options.basePath - The base path for the API. Defaults to BASE_PATH.
     * @param options.source - Optional source string to be sent with the API requests. Defaults to `sdk`.
     * @param options.sourceVersion - Optional source version string to be sent with the API requests.
     * @returns A new instance of the Coinbase SDK.
     */
    static configure({ apiKeyName, privateKey, useServerSigner, debugging, basePath, source, sourceVersion, }: CoinbaseOptions): Coinbase;
    /**
     * Reads the API key and private key from a JSON file and initializes the Coinbase SDK.
     *
     * @param options - The configuration options.
     * @param options.filePath - The path to the JSON file containing the API key and private key.
     * @param options.useServerSigner - Whether to use a Server-Signer or not.
     * @param options.debugging - If true, logs API requests and responses to the console.
     * @param options.basePath - The base path for the API.
     * @param options.source - Optional source string to be sent with the API requests. Defaults to `sdk`.
     * @param options.sourceVersion - Optional source version string to be sent with the API requests.
     * @returns A new instance of the Coinbase SDK.
     * @throws {InvalidAPIKeyFormat} If the file does not exist or the configuration values are missing/invalid.
     * @throws {InvalidConfiguration} If the configuration is invalid.
     * @throws {InvalidAPIKeyFormat} If not able to create JWT token.
     */
    static configureFromJson({ filePath, useServerSigner, debugging, basePath, source, sourceVersion, }?: CoinbaseConfigureFromJsonOptions): Coinbase;
    /**
     * Converts a network symbol to a string, replacing underscores with hyphens.
     *
     * @param network - The network symbol to convert
     * @returns the converted string
     */
    static normalizeNetwork(network: string): string;
    /**
     * Converts a string to a symbol, replacing hyphens with underscores.
     *
     * @param asset - The string to convert
     * @returns the converted symbol
     */
    static toAssetId(asset: string): string;
}
