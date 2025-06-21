"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Coinbase = void 0;
const axios_1 = __importDefault(require("axios"));
const axios_retry_1 = __importDefault(require("axios-retry"));
const fs = __importStar(require("fs"));
const client_1 = require("../client");
const base_1 = require("./../client/base");
const configuration_1 = require("./../client/configuration");
const authenticator_1 = require("./authenticator");
const errors_1 = require("./errors");
const utils_1 = require("./utils");
const os = __importStar(require("os"));
/**
 * The Coinbase SDK.
 */
class Coinbase {
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
    constructor({ apiKeyName, privateKey, useServerSigner = false, debugging = false, basePath = base_1.BASE_PATH, maxNetworkRetries = 3, source = "sdk", sourceVersion = undefined, }) {
        if (apiKeyName === "") {
            throw new errors_1.InvalidConfigurationError("Invalid configuration: apiKeyName is empty");
        }
        if (privateKey === "") {
            throw new errors_1.InvalidConfigurationError("Invalid configuration: privateKey is empty");
        }
        const coinbaseAuthenticator = new authenticator_1.CoinbaseAuthenticator(apiKeyName, privateKey, source, sourceVersion);
        const config = new configuration_1.Configuration({
            basePath: basePath,
        });
        const axiosInstance = axios_1.default.create();
        (0, axios_retry_1.default)(axiosInstance, {
            retries: maxNetworkRetries,
            retryCondition: (error) => {
                return (error.config?.method?.toUpperCase() === "GET" &&
                    (error.response?.status || 0) in [500, 502, 503, 504]);
            },
        });
        (0, utils_1.registerAxiosInterceptors)(axiosInstance, config => coinbaseAuthenticator.authenticateRequest(config, debugging), 
        /* istanbul ignore file */
        response => (0, utils_1.logApiResponse)(response, debugging));
        Coinbase.apiClients.wallet = (0, client_1.WalletsApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.smartWallet = (0, client_1.SmartWalletsApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.address = (0, client_1.AddressesApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.transfer = (0, client_1.TransfersApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.trade = (0, client_1.TradesApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.serverSigner = (0, client_1.ServerSignersApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.stake = (0, client_1.StakeApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.walletStake = (0, client_1.MPCWalletStakeApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.asset = (0, client_1.AssetsApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.webhook = (0, client_1.WebhooksApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.contractInvocation = (0, client_1.ContractInvocationsApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.externalAddress = (0, client_1.ExternalAddressesApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.balanceHistory = (0, client_1.BalanceHistoryApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.contractEvent = (0, client_1.ContractEventsApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.smartContract = (0, client_1.SmartContractsApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.fund = (0, client_1.FundApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiClients.transactionHistory = (0, client_1.TransactionHistoryApiFactory)(config, basePath, axiosInstance);
        Coinbase.apiKeyPrivateKey = privateKey;
        Coinbase.useServerSigner = useServerSigner;
        Coinbase.apiClients.addressReputation = (0, client_1.ReputationApiFactory)(config, basePath, axiosInstance);
    }
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
    static configure({ apiKeyName, privateKey, useServerSigner = false, debugging = false, basePath = base_1.BASE_PATH, source = "sdk", sourceVersion = undefined, }) {
        return new Coinbase({
            apiKeyName,
            privateKey,
            useServerSigner,
            debugging,
            basePath,
            source,
            sourceVersion,
        });
    }
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
    static configureFromJson({ filePath = "coinbase_cloud_api_key.json", useServerSigner = false, debugging = false, basePath = base_1.BASE_PATH, source = "sdk", sourceVersion = undefined, } = {}) {
        filePath = filePath.startsWith("~") ? filePath.replace("~", os.homedir()) : filePath;
        if (!fs.existsSync(filePath)) {
            throw new errors_1.InvalidConfigurationError(`Invalid configuration: file not found at ${filePath}`);
        }
        try {
            const data = fs.readFileSync(filePath, "utf8");
            // Support both "name" and "id" for the API key identifier.
            const config = JSON.parse(data);
            const apiKeyIdentifier = config.name || config.id;
            if (!apiKeyIdentifier || !config.privateKey) {
                throw new errors_1.InvalidAPIKeyFormatError("Invalid configuration: missing API key identifier or privateKey");
            }
            return new Coinbase({
                apiKeyName: apiKeyIdentifier,
                privateKey: config.privateKey,
                useServerSigner: useServerSigner,
                debugging: debugging,
                basePath: basePath,
                source,
                sourceVersion,
            });
        }
        catch (e) {
            if (e instanceof SyntaxError) {
                throw new errors_1.InvalidAPIKeyFormatError("Not able to parse the configuration file");
            }
            else {
                throw new errors_1.InvalidAPIKeyFormatError(`An error occurred while reading the configuration file: ${e.message}`);
            }
        }
    }
    /**
     * Converts a network symbol to a string, replacing underscores with hyphens.
     *
     * @param network - The network symbol to convert
     * @returns the converted string
     */
    static normalizeNetwork(network) {
        return network.replace(/_/g, "-");
    }
    /**
     * Converts a string to a symbol, replacing hyphens with underscores.
     *
     * @param asset - The string to convert
     * @returns the converted symbol
     */
    static toAssetId(asset) {
        return asset.replace(/-/g, "_");
    }
}
exports.Coinbase = Coinbase;
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
Coinbase.networks = client_1.NetworkIdentifier;
/**
 * The list of supported assets.
 *
 * @constant
 */
Coinbase.assets = {
    Eth: "eth",
    Wei: "wei",
    Gwei: "gwei",
    Usdc: "usdc",
    Weth: "weth",
    Sol: "sol",
    Lamport: "lamport",
    Eurc: "eurc",
    Cbbtc: "cbbtc",
};
Coinbase.apiClients = new Proxy({}, {
    get(target, prop) {
        if (!Reflect.has(target, prop)) {
            throw new errors_1.UninitializedSDKError();
        }
        return Reflect.get(target, prop);
    },
});
/**
 * The default page limit for list methods.
 *
 * @constant
 */
Coinbase.defaultPageLimit = 100;
