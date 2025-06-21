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
exports.Wallet = void 0;
const bip32_1 = require("@scure/bip32");
const bip39_1 = require("@scure/bip39");
const english_1 = require("@scure/bip39/wordlists/english");
const ethers_1 = require("ethers");
const crypto = __importStar(require("crypto"));
const decimal_js_1 = __importDefault(require("decimal.js"));
const ethers_2 = require("ethers");
const fs = __importStar(require("fs"));
const ed2curve = __importStar(require("ed2curve"));
const secp256k1 = __importStar(require("secp256k1"));
const wallet_address_1 = require("./address/wallet_address");
const asset_1 = require("./asset");
const balance_1 = require("./balance");
const balance_map_1 = require("./balance_map");
const coinbase_1 = require("./coinbase");
const errors_1 = require("./errors");
const types_1 = require("./types");
const utils_1 = require("./utils");
const webhook_1 = require("./webhook");
/**
 * A representation of a Wallet. Wallets come with a single default Address, but can expand to have a set of Addresses,
 * each of which can hold a balance of one or more Assets. Wallets can create new Addresses, list their addresses,
 * list their balances, and transfer Assets to other Addresses. Wallets should be created through User.createWallet or User.importWallet.
 * Wallets should be created using `Wallet.create`, imported using `Wallet.import`, or fetched using `Wallet.fetch`.
 * Existing wallets can be imported with a seed using `Wallet.import`.
 * Wallets backed by a Server Signer can be fetched with `Wallet.fetch` and used for signing operations immediately.
 */
class Wallet {
    /**
     * Private constructor to prevent direct instantiation outside of factory method. Use Wallet.init instead.
     *
     * @ignore
     * @param model - The wallet model object.
     * @param master - The HD master key.
     * @param seed - The seed to use for the Wallet. Expects a 32-byte hexadecimal with no 0x prefix.
     * @hideconstructor
     */
    constructor(model, master, seed) {
        this.addresses = [];
        this.addressPathPrefix = "m/44'/60'/0'/0";
        this.model = model;
        this.master = master;
        this.seed = seed;
    }
    /**
     * Lists the Wallets belonging to the CDP Project.
     *
     * @param options - The pagination options.
     * @param options.limit - The maximum number of Wallets to return. Limit can range between 1 and 100.
     * @param options.page - The cursor for pagination across multiple pages of Wallets. Don\&#39;t include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     *
     * @returns The paginated list response of Wallets.
     */
    static async listWallets({ limit = coinbase_1.Coinbase.defaultPageLimit, page = undefined, } = {}) {
        const data = [];
        let nextPage;
        const response = await coinbase_1.Coinbase.apiClients.wallet.listWallets(limit, page);
        const wallets = response.data.data;
        for (const wallet of wallets) {
            data.push(Wallet.init(wallet, ""));
        }
        const hasMore = response.data.has_more;
        if (hasMore) {
            if (response.data.next_page) {
                nextPage = response.data.next_page;
            }
        }
        return {
            data,
            hasMore,
            nextPage,
        };
    }
    /**
     * Fetches a Wallet by its ID. The returned wallet can be immediately used for signing operations if backed by a server signer.
     * If the wallet is not backed by a server signer, the wallet's seed will need to be set before it can be used for signing operations.
     *
     * @param wallet_id - The ID of the Wallet to fetch
     * @returns The fetched Wallet
     */
    static async fetch(wallet_id) {
        const response = await coinbase_1.Coinbase.apiClients.wallet.getWallet(wallet_id);
        return Wallet.init(response.data, "");
    }
    /**
     * Loads an existing CDP Wallet using a wallet data object or mnemonic seed phrase.
     *
     * @param data - The data used to import the wallet:
     *   - If WalletData: Must contain walletId (or wallet_id) and seed.
     *     Allows for the loading of an existing CDP wallet into CDP.
     *   - If MnemonicSeedPhrase: Must contain a valid BIP-39 mnemonic phrase (12, 15, 18, 21, or 24 words).
     *     Allows for the import of an external wallet into CDP as a 1-of-1 wallet.
     * @param networkId - the ID of the blockchain network. Defaults to 'base-sepolia'.
     * @returns A Promise that resolves to the loaded Wallet instance
     * @throws {ArgumentError} If the data format is invalid.
     * @throws {ArgumentError} If the seed is not provided.
     * @throws {ArgumentError} If the mnemonic seed phrase is invalid.
     */
    static async import(data, networkId = coinbase_1.Coinbase.networks.BaseSepolia) {
        // Check if data is a mnemonic seed phrase object
        if ((0, types_1.isMnemonicSeedPhrase)(data)) {
            // Handle mnemonic seed phrase object import
            if (!data.mnemonicPhrase) {
                throw new errors_1.ArgumentError("BIP-39 mnemonic seed phrase must be provided");
            }
            if (!(0, bip39_1.validateMnemonic)(data.mnemonicPhrase, english_1.wordlist)) {
                throw new errors_1.ArgumentError("Invalid BIP-39 mnemonic seed phrase");
            }
            // Convert mnemonic phrase to seed
            const seedBuffer = (0, bip39_1.mnemonicToSeedSync)(data.mnemonicPhrase);
            const seed = (0, ethers_1.hexlify)(seedBuffer).slice(2); // remove 0x prefix
            // Create wallet using the provided seed
            const wallet = await Wallet.createWithSeed({
                seed: seed,
                networkId,
            });
            // Ensure the wallet is created
            await wallet.listAddresses();
            return wallet;
        }
        else if ((0, types_1.isWalletData)(data)) {
            // Handle WalletData object import
            const walletId = data.walletId || data.wallet_id;
            if (!walletId) {
                throw new errors_1.ArgumentError("Wallet ID must be provided");
            }
            if (!data.seed) {
                throw new errors_1.ArgumentError("Seed must be provided");
            }
            const walletModel = await coinbase_1.Coinbase.apiClients.wallet.getWallet(walletId);
            const wallet = Wallet.init(walletModel.data, data.seed);
            await wallet.listAddresses();
            return wallet;
        }
        else {
            throw new errors_1.ArgumentError("Invalid import data format");
        }
    }
    /**
     * Creates a new Wallet with a random seed.
     *
     * @constructs Wallet
     * @param options - The options to create the Wallet.
     * @param options.networkId - the ID of the blockchain network. Defaults to 'base-sepolia'.
     * @param options.intervalSeconds - The interval at which to poll the backend, in seconds.
     * @param options.timeoutSeconds - The maximum amount of time to wait for the ServerSigner to create a seed, in seconds.
     * @throws {ArgumentError} If the model or client is not provided.
     * @throws {Error} - If address derivation or caching fails.
     * @throws {APIError} - If the request fails.
     * @returns A promise that resolves with the new Wallet object.
     */
    static async create({ networkId = coinbase_1.Coinbase.networks.BaseSepolia, timeoutSeconds = 20, intervalSeconds = 0.2, } = {}) {
        return Wallet.createWithSeed({
            networkId,
            timeoutSeconds,
            intervalSeconds,
        });
    }
    /**
     * Creates a new Wallet with the given seed.
     *
     * @param options - The options to create the Wallet.
     * @param options.seed - The seed to use for the Wallet. If undefined, a random seed will be generated.
     * @param options.networkId - the ID of the blockchain network. Defaults to 'base-sepolia'.
     * @param options.intervalSeconds - The interval at which to poll the backend, in seconds.
     * @param options.timeoutSeconds - The maximum amount of time to wait for the ServerSigner to create a seed, in seconds.
     * @throws {ArgumentError} If the model or client is not provided.
     * @throws {Error} - If address derivation or caching fails.
     * @throws {APIError} - If the request fails.
     * @returns A promise that resolves with the new Wallet object.
     */
    static async createWithSeed({ seed = undefined, networkId = coinbase_1.Coinbase.networks.BaseSepolia, timeoutSeconds = 20, intervalSeconds = 0.2, } = {}) {
        const result = await coinbase_1.Coinbase.apiClients.wallet.createWallet({
            wallet: {
                network_id: networkId,
                use_server_signer: coinbase_1.Coinbase.useServerSigner,
            },
        });
        const wallet = Wallet.init(result.data, seed);
        if (coinbase_1.Coinbase.useServerSigner) {
            await wallet.waitForSigner(wallet.getId(), intervalSeconds, timeoutSeconds);
        }
        await wallet.createAddress();
        return wallet;
    }
    /**
     * Returns a new Wallet object. Do not use this method directly. Instead, use one of:
     * - Wallet.create (Create a new Wallet),
     * - Wallet.import (Import a Wallet with seed),
     * - Wallet.fetch (fetch a Wallet by ID w/o seed, useful for server signer wallets).
     *
     * @constructs Wallet
     * @param model - The underlying Wallet model object
     * @param seed - The seed to use for the Wallet. Expects a 32-byte hexadecimal with no 0x prefix. If null or undefined, a new seed will be generated.
     * If the empty string, no seed is generated, and the Wallet will be instantiated without a seed and its corresponding private keys.
     * @throws {ArgumentError} If the model or client is not provided.
     * @throws {Error} - If address derivation or caching fails.
     * @throws {APIError} - If the request fails.
     * @returns A promise that resolves with the new Wallet object.
     */
    static init(model, seed) {
        const wallet = new Wallet(model, undefined, seed);
        if (coinbase_1.Coinbase.useServerSigner) {
            return wallet;
        }
        wallet.setMasterNode(seed);
        return wallet;
    }
    /**
     * Exports the Wallet's data to a WalletData object.
     *
     * @returns The Wallet's data.
     * @throws {APIError} - If the request fails.
     */
    export() {
        if (!this.seed) {
            throw new Error("Cannot export Wallet without loaded seed");
        }
        return {
            walletId: this.getId(),
            seed: this.seed,
            networkId: this.getNetworkId(),
        };
    }
    /**
     * Creates a new Address in the Wallet.
     *
     * @returns The new Address.
     * @throws {APIError} - If the address creation fails.
     */
    async createAddress() {
        let payload, key;
        if (!coinbase_1.Coinbase.useServerSigner) {
            // TODO: Coordinate this value with concurrent calls to createAddress.
            const addressIndex = this.addresses.length;
            const hdKey = this.deriveKey(addressIndex);
            const attestation = this.createAttestation(hdKey);
            const publicKey = (0, utils_1.convertStringToHex)(hdKey.publicKey);
            key = new ethers_2.ethers.Wallet((0, utils_1.convertStringToHex)(hdKey.privateKey));
            payload = {
                public_key: publicKey,
                attestation: attestation,
                address_index: addressIndex,
            };
        }
        const response = await coinbase_1.Coinbase.apiClients.address.createAddress(this.model.id, payload);
        if (!this.addresses.length || !coinbase_1.Coinbase.useServerSigner) {
            await this.reload();
        }
        const address = new wallet_address_1.WalletAddress(response.data, key);
        this.addresses.push(address);
        return address;
    }
    /**
     * Set the seed for the Wallet.
     *
     * @param seed - The seed to use for the Wallet. Expects a 32-byte hexadecimal with no 0x prefix.
     * @throws {ArgumentError} If the seed is empty.
     * @throws {Error} If the seed is already set.
     */
    setSeed(seed) {
        if (seed === undefined || seed === "") {
            throw new errors_1.ArgumentError("Seed must not be empty");
        }
        if (this.master) {
            throw new Error("Seed is already set");
        }
        this.setMasterNode(seed);
        if (this.addresses.length < 1) {
            return;
        }
        this.addresses.forEach((address, index) => {
            const derivedKey = this.deriveKey(index);
            const etherWallet = new ethers_2.ethers.Wallet((0, utils_1.convertStringToHex)(derivedKey.privateKey));
            if (etherWallet.address != address.getId()) {
                throw new Error(`Seed does not match wallet; cannot find address ${etherWallet.address}`);
            }
            address.setKey(etherWallet);
        });
    }
    /**
     * Returns the WalletAddress with the given ID.
     *
     * @param addressId - The ID of the WalletAddress to retrieve.
     * @returns The WalletAddress.
     */
    async getAddress(addressId) {
        if (this.addresses.length < 1) {
            this.addresses = await this.listAddresses();
        }
        return this.addresses.find(address => {
            return address.getId() === addressId;
        });
    }
    /**
     * Returns the list of Addresses in the Wallet.
     *
     * @returns The list of Addresses.
     */
    async listAddresses() {
        const response = await coinbase_1.Coinbase.apiClients.address.listAddresses(this.getId(), Wallet.MAX_ADDRESSES);
        const addresses = response.data.data.map(address => {
            return this.buildWalletAddress(address, address.index);
        });
        this.addresses = addresses;
        return addresses;
    }
    /**
     *  Trades the given amount of the given Asset for another Asset.
     *  Currently only the default address is used to source the Trade.
     *
     * @param options - The options to create the Trade.
     * @param options.amount - The amount of the Asset to send.
     * @param options.fromAssetId - The ID of the Asset to trade from.
     * @param options.toAssetId - The ID of the Asset to trade to.
     * @throws {Error} If the default address is not found.
     * @throws {Error} If the private key is not loaded, or if the asset IDs are unsupported, or if there are insufficient funds.
     * @returns The created Trade object.
     */
    async createTrade(options) {
        return (await this.getDefaultAddress()).createTrade(options);
    }
    /**
     * Get the stakeable balance for the supplied asset.
     *
     * @param asset_id - The asset to check the stakeable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the stakeable balance.
     * @throws {Error} if the default address is not found.
     * @returns The stakeable balance.
     */
    async stakeableBalance(asset_id, mode = types_1.StakeOptionsMode.DEFAULT, options = {}) {
        return (await this.getDefaultAddress()).stakeableBalance(asset_id, mode, options);
    }
    /**
     * Get the unstakeable balance for the supplied asset.
     *
     * @param asset_id - The asset to check the unstakeable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the unstakeable balance.
     * @throws {Error} if the default address is not found.
     * @returns The unstakeable balance.
     */
    async unstakeableBalance(asset_id, mode = types_1.StakeOptionsMode.DEFAULT, options = {}) {
        return (await this.getDefaultAddress()).unstakeableBalance(asset_id, mode, options);
    }
    /**
     * Get the pending claimable balance for the supplied asset.
     *
     * @param asset_id - The asset to check pending claimable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the pending claimable balance.
     * @throws {Error} if the default address is not found.
     * @returns The pending claimable balance.
     */
    async pendingClaimableBalance(asset_id, mode = types_1.StakeOptionsMode.DEFAULT, options = {}) {
        return (await this.getDefaultAddress()).pendingClaimableBalance(asset_id, mode, options);
    }
    /**
     * Get the claimable balance for the supplied asset.
     *
     * @param asset_id - The asset to check claimable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the claimable balance.
     * @throws {Error} if the default address is not found.
     * @returns The claimable balance.
     */
    async claimableBalance(asset_id, mode = types_1.StakeOptionsMode.DEFAULT, options = {}) {
        return (await this.getDefaultAddress()).claimableBalance(asset_id, mode, options);
    }
    /**
     * Lists the staking rewards for the address.
     *
     * @param assetId - The asset ID.
     * @param startTime - The start time.
     * @param endTime - The end time.
     * @param format - The format to return the rewards in. (usd, native). Defaults to usd.
     * @throws {Error} if the default address is not found.
     * @returns The staking rewards.
     */
    async stakingRewards(assetId, startTime = (0, utils_1.getWeekBackDate)(new Date()), endTime = (0, utils_1.formatDate)(new Date()), format = types_1.StakingRewardFormat.USD) {
        return (await this.getDefaultAddress()).stakingRewards(assetId, startTime, endTime, format);
    }
    /**
     * Lists the historical staking balances for the address.
     *
     * @param assetId - The asset ID.
     * @param startTime - The start time.
     * @param endTime - The end time.
     * @throws {Error} if the default address is not found.
     * @returns The staking balances.
     */
    async historicalStakingBalances(assetId, startTime = (0, utils_1.getWeekBackDate)(new Date()), endTime = (0, utils_1.formatDate)(new Date())) {
        return (await this.getDefaultAddress()).historicalStakingBalances(assetId, startTime, endTime);
    }
    /**
     * Lists the historical balances for a given asset belonging to the default address of the wallet.
     *
     * @param assetId - The asset ID.
     * @param options - The pagination options.
     * @param options.limit - The maximum number of Historical Balances to return. Limit can range between 1 and 100.
     * @param options.page - The cursor for pagination across multiple pages of Historical Balances. Don\&#39;t include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     *
     * @returns The paginated list response of Historical Balances for the given Asset ID.
     */
    async listHistoricalBalances(assetId, { limit = coinbase_1.Coinbase.defaultPageLimit, page = undefined } = {}) {
        return (await this.getDefaultAddress()).listHistoricalBalances(assetId, { limit, page });
    }
    /**
     * Creates a staking operation to stake, signs it, and broadcasts it on the blockchain.
     *
     * @param amount - The amount for the staking operation.
     * @param assetId - The asset for the staking operation.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options such as setting the mode for the staking action.
     * @param timeoutSeconds - The amount to wait for the transaction to complete when broadcasted.
     * @param intervalSeconds - The amount to check each time for a successful broadcast.
     * @throws {Error} if the default address is not found.
     * @returns The staking operation after it's completed fully.
     */
    async createStake(amount, assetId, mode = types_1.StakeOptionsMode.DEFAULT, options = {}, timeoutSeconds = 60, intervalSeconds = 0.2) {
        return (await this.getDefaultAddress()).createStake(amount, assetId, mode, options, timeoutSeconds, intervalSeconds);
    }
    /**
     * Creates a staking operation to unstake, signs it, and broadcasts it on the blockchain.
     *
     * @param amount - The amount for the staking operation.
     * @param assetId - The asset for the staking operation.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options such as setting the mode for the staking action.
     * @param timeoutSeconds - The amount to wait for the transaction to complete when broadcasted.
     * @param intervalSeconds - The amount to check each time for a successful broadcast.
     * @throws {Error} if the default address is not found.
     * @returns The staking operation after it's completed successfully.
     */
    async createUnstake(amount, assetId, mode = types_1.StakeOptionsMode.DEFAULT, options = {}, timeoutSeconds = 60, intervalSeconds = 0.2) {
        return (await this.getDefaultAddress()).createUnstake(amount, assetId, mode, options, timeoutSeconds, intervalSeconds);
    }
    /**
     * Creates a staking operation to claim stake, signs it, and broadcasts it on the blockchain.
     *
     * @param amount - The amount for the staking operation.
     * @param assetId - The asset for the staking operation.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options such as setting the mode for the staking action.
     * @param timeoutSeconds - The amount to wait for the transaction to complete when broadcasted.
     * @param intervalSeconds - The amount to check each time for a successful broadcast.
     * @throws {Error} if the default address is not found.
     * @returns The staking operation after it's completed fully.
     */
    async createClaimStake(amount, assetId, mode = types_1.StakeOptionsMode.DEFAULT, options = {}, timeoutSeconds = 60, intervalSeconds = 0.2) {
        return (await this.getDefaultAddress()).createClaimStake(amount, assetId, mode, options, timeoutSeconds, intervalSeconds);
    }
    /**
     * Returns the list of balances of this Wallet. Balances are aggregated across all Addresses in the Wallet.
     *
     * @returns The list of balances. The key is the Asset ID, and the value is the balance.
     */
    async listBalances() {
        const response = await coinbase_1.Coinbase.apiClients.wallet.listWalletBalances(this.model.id);
        return balance_map_1.BalanceMap.fromBalances(response.data.data);
    }
    /**
     * Returns the balance of the provided Asset. Balances are aggregated across all Addresses in the Wallet.
     *
     * @param assetId - The ID of the Asset to retrieve the balance for.
     * @returns The balance of the Asset.
     */
    async getBalance(assetId) {
        const response = await coinbase_1.Coinbase.apiClients.wallet.getWalletBalance(this.model.id, asset_1.Asset.primaryDenomination(assetId));
        if (!response.data.amount) {
            return new decimal_js_1.default(0);
        }
        const balance = balance_1.Balance.fromModelAndAssetId(response.data, assetId);
        return balance.amount;
    }
    /**
     * Returns the Network ID of the Wallet.
     *
     * @returns The network ID.
     */
    getNetworkId() {
        return this.model.network_id;
    }
    /**
     * Returns the ServerSigner Status of the Wallet.
     *
     * @returns the ServerSigner Status.
     */
    getServerSignerStatus() {
        const status = {
            pending_seed_creation: types_1.ServerSignerStatus.PENDING,
            active_seed: types_1.ServerSignerStatus.ACTIVE,
        };
        return this.model.server_signer_status ? status[this.model.server_signer_status] : undefined;
    }
    /**
     * Returns the wallet ID.
     *
     * @returns The wallet ID.
     */
    getId() {
        return this.model.id;
    }
    /**
     * Saves the seed of the Wallet to the given file.
     *
     * @deprecated Use saveSeedToFile() instead
     * @param filePath - The path of the file to save the seed to
     * @param encrypt - Whether the seed information persisted to the local file system should be
     * encrypted or not. Data is unencrypted by default.
     * @returns A string indicating the success of the operation
     * @throws {Error} If the Wallet does not have a seed
     */
    saveSeed(filePath, encrypt = false) {
        return this.saveSeedToFile(filePath, encrypt);
    }
    /**
     * Saves the seed of the Wallet to the given file. Wallets whose seeds are saved this way can be
     * rehydrated using load_seed. A single file can be used for multiple Wallet seeds.
     * This is an insecure method of storing Wallet seeds and should only be used for development purposes.
     *
     * @param filePath - The path of the file to save the seed to
     * @param encrypt - Whether the seed information persisted to the local file system should be
     * encrypted or not. Data is unencrypted by default.
     * @returns A string indicating the success of the operation
     * @throws {Error} If the Wallet does not have a seed
     */
    saveSeedToFile(filePath, encrypt = false) {
        if (!this.master) {
            throw new Error("Cannot save Wallet without loaded seed");
        }
        const existingSeedsInStore = this.getExistingSeeds(filePath);
        const data = this.export();
        let seedToStore = data.seed;
        let authTag = "";
        let iv = "";
        if (encrypt) {
            const ivBytes = crypto.randomBytes(12);
            const sharedSecret = this.getEncryptionKey();
            const cipher = crypto.createCipheriv("aes-256-gcm", crypto.createHash("sha256").update(sharedSecret).digest(), ivBytes);
            const encryptedData = Buffer.concat([cipher.update(data.seed, "utf8"), cipher.final()]);
            authTag = cipher.getAuthTag().toString("hex");
            seedToStore = encryptedData.toString("hex");
            iv = ivBytes.toString("hex");
        }
        existingSeedsInStore[data.walletId] = {
            seed: seedToStore,
            encrypted: encrypt,
            authTag: authTag,
            iv: iv,
            networkId: data.networkId,
        };
        fs.writeFileSync(filePath, JSON.stringify(existingSeedsInStore, null, 2), "utf8");
        return `Successfully saved seed for ${data.walletId} to ${filePath}.`;
    }
    /**
     * Loads the seed of the Wallet from the given file.
     *
     * @deprecated Use loadSeedFromFile() instead
     * @param filePath - The path of the file to load the seed from
     * @returns A string indicating the success of the operation
     */
    async loadSeed(filePath) {
        return this.loadSeedFromFile(filePath);
    }
    /**
     * Loads the seed of the Wallet from the given file.
     *
     * @param filePath - The path of the file to load the seed from
     * @returns A string indicating the success of the operation
     */
    async loadSeedFromFile(filePath) {
        const existingSeedsInStore = this.getExistingSeeds(filePath);
        if (Object.keys(existingSeedsInStore).length === 0) {
            throw new errors_1.ArgumentError(`File ${filePath} does not contain any seed data`);
        }
        if (existingSeedsInStore[this.getId()] === undefined) {
            throw new errors_1.ArgumentError(`File ${filePath} does not contain seed data for wallet ${this.getId()}`);
        }
        const seedData = existingSeedsInStore[this.getId()];
        let seed = seedData.seed;
        if (!seed) {
            /* istanbul ignore next */
            throw new errors_1.ArgumentError("Seed data is malformed");
        }
        if (seedData.encrypted) {
            const sharedSecret = this.getEncryptionKey();
            if (!seedData.iv || !seedData.authTag) {
                /* istanbul ignore next */
                throw new errors_1.ArgumentError("Encrypted seed data is malformed");
            }
            const decipher = crypto.createDecipheriv("aes-256-gcm", crypto.createHash("sha256").update(sharedSecret).digest(), Buffer.from(seedData.iv, "hex"));
            decipher.setAuthTag(Buffer.from(seedData.authTag, "hex"));
            const decryptedData = Buffer.concat([
                decipher.update(Buffer.from(seed, "hex")),
                decipher.final(),
            ]);
            seed = decryptedData.toString("utf8");
        }
        this.setSeed(seed);
        await this.listAddresses();
        return `Successfully loaded seed for wallet ${this.getId()} from ${filePath}.`;
    }
    /**
     * Returns the default address of the Wallet.
     *
     * @returns The default address
     */
    async getDefaultAddress() {
        if (this.model.default_address === undefined) {
            throw new Error("WalletModel default address not set");
        }
        const defaultAddress = await this.getAddress(this.model.default_address.address_id);
        if (!defaultAddress) {
            throw new Error("Default address not found");
        }
        return defaultAddress;
    }
    /**
     * Returns whether the Wallet has a seed with which to derive keys and sign transactions.
     *
     * @returns Whether the Wallet has a seed with which to derive keys and sign transactions.
     */
    canSign() {
        return this.master?.publicKey !== undefined;
    }
    /**
     * Requests funds from the faucet for the Wallet's default address and returns the faucet transaction.
     * This is only supported on testnet networks.
     *
     * @param assetId - The ID of the Asset to request from the faucet.
     * @throws {Error} If the default address is not found.
     * @throws {APIError} If the request fails.
     * @returns The successful faucet transaction
     */
    async faucet(assetId) {
        if (!this.model.default_address) {
            throw new Error("Default address not found");
        }
        const transaction = (await this.getDefaultAddress()).faucet(assetId);
        return transaction;
    }
    /**
     * Transfers the given amount of the given Asset to the given address. Only same-Network Transfers are supported.
     * Currently only the default_address is used to source the Transfer.
     *
     * @param options - The options to create the Transfer.
     * @param options.amount - The amount of the Asset to send.
     * @param options.assetId - The ID of the Asset to send.
     * @param options.destination - The destination of the transfer. If a Wallet, sends to the Wallet's default address. If a String, interprets it as the address ID.
     * @param options.gasless - Whether the Transfer should be gasless. Defaults to false.
     * @param options.skipBatching - When true, the Transfer will be submitted immediately. Otherwise, the Transfer will be batched. Defaults to false. Note: requires gasless option to be set to true.
     * @returns The created Transfer object.
     * @throws {APIError} if the API request to create a Transfer fails.
     * @throws {APIError} if the API request to broadcast a Transfer fails.
     */
    async createTransfer(options) {
        return (await this.getDefaultAddress()).createTransfer(options);
    }
    /**
     * Creates a Payload Signature.
     *
     * @param unsignedPayload - The Unsigned Payload to sign.
     * @returns A promise that resolves to the Payload Signature object.
     * @throws {APIError} if the API request to create a Payload Signature fails.
     * @throws {Error} if the default address is not found.
     */
    async createPayloadSignature(unsignedPayload) {
        return (await this.getDefaultAddress()).createPayloadSignature(unsignedPayload);
    }
    /**
     * Creates a Webhook for a wallet, monitors all wallet addresses for onchain events.
     *
     * @param notificationUri - The URI to which the webhook notifications will be sent.
     *
     * @returns The newly created webhook instance.
     */
    async createWebhook(notificationUri) {
        const result = await coinbase_1.Coinbase.apiClients.webhook.createWalletWebhook(this.getId(), {
            notification_uri: notificationUri,
        });
        return webhook_1.Webhook.init(result.data);
    }
    /**
     * Invokes a contract with the given data.
     *
     * @param options - The options to invoke the contract
     * @param options.contractAddress - The address of the contract the method will be invoked on.
     * @param options.method - The method to invoke on the contract.
     * @param options.abi - The ABI of the contract.
     * @param options.args - The arguments to pass to the contract method invocation.
     *   The keys should be the argument names and the values should be the argument values.
     * @param options.amount - The amount of the asset to send to a payable contract method.
     * @param options.assetId - The ID of the asset to send to a payable contract method.
     *   The asset must be a denomination of the native asset. (Ex. "wei", "gwei", or "eth").
     * @returns The ContractInvocation object.
     * @throws {APIError} if the API request to create a contract invocation fails.
     */
    async invokeContract(options) {
        return (await this.getDefaultAddress()).invokeContract(options);
    }
    /**
     * Deploys an ERC20 token contract.
     *
     * @param options - The options for creating the ERC20 token.
     * @param options.name - The name of the ERC20 token.
     * @param options.symbol - The symbol of the ERC20 token.
     * @param options.totalSupply - The total supply of the ERC20 token.
     * @returns A Promise that resolves to the deployed SmartContract object.
     * @throws {Error} If the private key is not loaded when not using server signer.
     */
    async deployToken(options) {
        return (await this.getDefaultAddress()).deployToken(options);
    }
    /**
     * Deploys an ERC721 token contract.
     *
     * @param options - The options for creating the ERC721 token.
     * @param options.name - The name of the ERC721 token.
     * @param options.symbol - The symbol of the ERC721 token.
     * @param options.baseURI - The base URI of the ERC721 token.
     * @returns A Promise that resolves to the deployed SmartContract object.
     * @throws {Error} If the private key is not loaded when not using server signer.
     */
    async deployNFT(options) {
        return (await this.getDefaultAddress()).deployNFT(options);
    }
    /**
     * Deploys an ERC1155 token contract.
     *
     * @param options - The options for creating the ERC1155 token.
     * @param options.name - The name of the ERC1155 token.
     * @param options.symbol - The symbol of the ERC1155 token.
     * @param options.baseURI - The base URI of the ERC1155 token.
     * @returns A Promise that resolves to the deployed SmartContract object.
     * @throws {Error} If the private key is not loaded when not using server signer.
     */
    async deployMultiToken(options) {
        return (await this.getDefaultAddress()).deployMultiToken(options);
    }
    /**
     * Deploys a custom contract.
     *
     * @param options - The options for creating the custom contract.
     * @param options.solidityVersion - The version of the solidity compiler, must be 0.8.+, such as "0.8.28+commit.7893614a". See https://binaries.soliditylang.org/bin/list.json
     * @param options.solidityInputJson - The input json for the solidity compiler. See https://docs.soliditylang.org/en/latest/using-the-compiler.html#input-description for more details.
     * @param options.contractName - The name of the contract class to be deployed.
     * @param options.constructorArgs - The arguments for the constructor.
     * @returns A Promise that resolves to the deployed SmartContract object.
     * @throws {Error} If the private key is not loaded when not using server signer.
     */
    async deployContract(options) {
        return (await this.getDefaultAddress()).deployContract(options);
    }
    /**
     * Fund the wallet from your account on the Coinbase Platform.
     *
     * @param options - The options to create the fund operation
     * @param options.amount - The amount of the Asset to fund the wallet with
     * @param options.assetId - The ID of the Asset to fund with. For Ether, eth, gwei, and wei are supported.
     * @returns The created fund operation object
     * @throws {Error} If the default address does not exist
     */
    async fund(options) {
        const defaultAddress = await this.getDefaultAddress();
        if (!defaultAddress) {
            throw new Error("Default address does not exist");
        }
        return defaultAddress.fund(options);
    }
    /**
     * Get a quote for funding the wallet from your Coinbase platform account.
     *
     * @param options - The options to create the fund quote
     * @param options.amount - The amount to fund
     * @param options.assetId - The ID of the Asset to fund with. For Ether, eth, gwei, and wei are supported.
     * @returns The fund quote object
     * @throws {Error} If the default address does not exist
     */
    async quoteFund(options) {
        const defaultAddress = await this.getDefaultAddress();
        if (!defaultAddress) {
            throw new Error("Default address does not exist");
        }
        return defaultAddress.quoteFund(options);
    }
    /**
     * Returns all the fund operations associated with the wallet's default address.
     *
     * @param options - The pagination options.
     * @param options.limit - The maximum number of fund operations to return. Limit can range between 1 and 100.
     * @param options.page - The cursor for pagination across multiple pages of fund operations. Don't include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     * @returns The paginated list response of fund operations.
     * @throws {Error} If the default address does not exist
     */
    async listFundOperations({ limit = coinbase_1.Coinbase.defaultPageLimit, page = undefined, } = {}) {
        const defaultAddress = await this.getDefaultAddress();
        if (!defaultAddress) {
            throw new Error("Default address does not exist");
        }
        return defaultAddress.listFundOperations({ limit, page });
    }
    /**
     * Returns a String representation of the Wallet.
     *
     * @returns a String representation of the Wallet
     */
    toString() {
        return `Wallet{id: '${this.model.id}', networkId: '${this.model.network_id}'}`;
    }
    /**
     * Validates the seed and address models passed to the constructor.
     *
     * @param seed - The seed to use for the Wallet
     */
    validateSeed(seed) {
        if (seed && seed.length !== 64 && seed.length !== 128) {
            throw new errors_1.ArgumentError("Seed must be 32 or 64 bytes");
        }
    }
    /**
     * Loads the seed data from the given file.
     *
     * @param filePath - The path of the file to load the seed data from
     * @returns The seed data
     */
    getExistingSeeds(filePath) {
        try {
            const data = fs.readFileSync(filePath, "utf8");
            if (!data) {
                return {};
            }
            const seedData = JSON.parse(data);
            if (!Object.entries(seedData).every(([key, value]) => typeof key === "string" &&
                /* eslint-disable @typescript-eslint/no-explicit-any */
                typeof value.authTag === "string" &&
                typeof value.encrypted === "boolean" &&
                typeof value.iv === "string" &&
                typeof value.seed === "string")) {
                throw new errors_1.ArgumentError("Malformed backup data");
            }
            return seedData;
        }
        catch (error) {
            /* eslint-enable @typescript-eslint/no-explicit-any */
            if (error.code === "ENOENT") {
                return {};
            }
            throw new errors_1.ArgumentError("Malformed backup data");
        }
    }
    /**
     * Gets the key for encrypting seed data.
     *
     * For EC keys (PEM format), it uses crypto.diffieHellman.
     * For Ed25519 keys (assumed to be a base64-encoded 64-byte string), it converts the secret key
     * to an X25519 key using ed2curve.
     *
     * @returns The encryption key.
     */
    getEncryptionKey() {
        const apiKeyPrivateKey = coinbase_1.Coinbase.apiKeyPrivateKey;
        if (apiKeyPrivateKey.startsWith("-----BEGIN")) {
            // Assume EC key in PEM format.
            const privateKey = crypto.createPrivateKey(apiKeyPrivateKey);
            const publicKey = crypto.createPublicKey(apiKeyPrivateKey);
            return crypto.diffieHellman({ privateKey, publicKey });
        }
        else {
            // Assume Ed25519 key: a base64-encoded 64-byte string (first 32 bytes = seed, next 32 = public key)
            const decoded = Buffer.from(apiKeyPrivateKey, "base64");
            if (decoded.length !== 64) {
                throw new Error("Invalid Ed25519 key format");
            }
            const seed = decoded.slice(0, 32);
            // Convert the Ed25519 seed to an X25519 key using ed2curve.
            const x25519 = ed2curve.convertSecretKey(new Uint8Array(seed));
            if (!x25519) {
                throw new Error("Failed to convert Ed25519 key to X25519");
            }
            return Buffer.from(x25519);
        }
    }
    /**
     * Returns a WalletAddress object for the given AddressModel.
     *
     * @param addressModel - The AddressModel to build the WalletAddress from.
     * @param index - The index of the AddressModel.
     * @returns The WalletAddress object.
     */
    buildWalletAddress(addressModel, index) {
        if (!this.master) {
            return new wallet_address_1.WalletAddress(addressModel);
        }
        const key = this.deriveKey(index);
        const ethWallet = new ethers_2.ethers.Wallet((0, utils_1.convertStringToHex)(key.privateKey));
        if (ethWallet.address != addressModel.address_id) {
            throw new Error(`Seed does not match wallet`);
        }
        return new wallet_address_1.WalletAddress(addressModel, ethWallet);
    }
    /**
     * Waits until the ServerSigner has created a seed for the Wallet.
     *
     * @param walletId - The ID of the Wallet that is awaiting seed creation.
     * @param intervalSeconds - The interval at which to poll the CDPService, in seconds.
     * @param timeoutSeconds - The maximum amount of time to wait for the ServerSigner to create a seed, in seconds.
     * @throws {APIError} if the API request to get a Wallet fails.
     * @throws {Error} if the ServerSigner times out.
     */
    async waitForSigner(walletId, intervalSeconds = 0.2, timeoutSeconds = 20) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutSeconds * 1000) {
            const response = await coinbase_1.Coinbase.apiClients.wallet.getWallet(walletId);
            if (response?.data.server_signer_status === types_1.ServerSignerStatus.ACTIVE) {
                return;
            }
            await (0, utils_1.delay)(intervalSeconds);
        }
        throw new Error("Wallet creation timed out. Check status of your Server-Signer");
    }
    /**
     * Sets the master node for the given seed, if valid. If the seed is undefined it will set the master node using a random seed.
     *
     * @param seed - The seed to use for the Wallet.
     * @returns The master node for the given seed.
     */
    setMasterNode(seed) {
        if (seed === "") {
            return undefined;
        }
        if (seed === undefined) {
            seed = ethers_2.ethers.Wallet.createRandom().privateKey.slice(2);
        }
        this.validateSeed(seed);
        this.seed = seed;
        this.master = bip32_1.HDKey.fromMasterSeed(Buffer.from(seed, "hex"));
    }
    /**
     * Derives a key for an already registered Address in the Wallet.
     *
     * @param index - The index of the Address to derive.
     * @throws {Error} - If the key derivation fails.
     * @returns The derived key.
     */
    deriveKey(index) {
        if (!this.master) {
            throw new Error("Cannot derive key for Wallet without seed loaded");
        }
        const derivedKey = this.master?.derive(this.addressPathPrefix + `/${index}`);
        if (!derivedKey?.privateKey) {
            throw new Error("Failed to derive key");
        }
        return derivedKey;
    }
    /**
     * Creates an attestation for the Address currently being created.
     *
     * @param key - The key of the Wallet.
     * @returns The attestation.
     */
    createAttestation(key) {
        if (!key.publicKey || !key.privateKey) {
            /* istanbul ignore next */
            throw Error;
        }
        const publicKey = (0, utils_1.convertStringToHex)(key.publicKey);
        const payload = JSON.stringify({
            wallet_id: this.model.id,
            public_key: publicKey,
        });
        const hashedPayload = crypto.createHash("sha256").update(payload).digest();
        const signature = secp256k1.ecdsaSign(hashedPayload, key.privateKey);
        const r = signature.signature.slice(0, 32);
        const s = signature.signature.slice(32, 64);
        const v = signature.recid + 27 + 4;
        const newSignatureBuffer = Buffer.concat([Buffer.from([v]), r, s]);
        const newSignatureHex = newSignatureBuffer.toString("hex");
        return newSignatureHex;
    }
    /**
     * Reloads the Wallet model with the latest data from the server.
     *
     * @throws {APIError} if the API request to get a Wallet fails.
     */
    async reload() {
        const result = await coinbase_1.Coinbase.apiClients.wallet.getWallet(this.model.id);
        this.model = result?.data;
    }
}
exports.Wallet = Wallet;
Wallet.MAX_ADDRESSES = 20;
