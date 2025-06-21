import Decimal from "decimal.js";
import { Wallet as WalletModel } from "../client";
import { Address } from "./address";
import { WalletAddress } from "./address/wallet_address";
import { BalanceMap } from "./balance_map";
import { FaucetTransaction } from "./faucet_transaction";
import { Trade } from "./trade";
import { Transfer } from "./transfer";
import { Amount, StakingRewardFormat, CreateContractInvocationOptions, CreateTransferOptions, CreateTradeOptions, ServerSignerStatus, StakeOptionsMode, WalletCreateOptions, WalletData, MnemonicSeedPhrase, CreateERC20Options, CreateERC721Options, CreateERC1155Options, PaginationOptions, PaginationResponse, CreateFundOptions, CreateQuoteOptions, CreateCustomContractOptions } from "./types";
import { StakingOperation } from "./staking_operation";
import { StakingReward } from "./staking_reward";
import { StakingBalance } from "./staking_balance";
import { PayloadSignature } from "./payload_signature";
import { ContractInvocation } from "../coinbase/contract_invocation";
import { SmartContract } from "./smart_contract";
import { Webhook } from "./webhook";
import { HistoricalBalance } from "./historical_balance";
import { FundOperation } from "./fund_operation";
import { FundQuote } from "./fund_quote";
/**
 * A representation of a Wallet. Wallets come with a single default Address, but can expand to have a set of Addresses,
 * each of which can hold a balance of one or more Assets. Wallets can create new Addresses, list their addresses,
 * list their balances, and transfer Assets to other Addresses. Wallets should be created through User.createWallet or User.importWallet.
 * Wallets should be created using `Wallet.create`, imported using `Wallet.import`, or fetched using `Wallet.fetch`.
 * Existing wallets can be imported with a seed using `Wallet.import`.
 * Wallets backed by a Server Signer can be fetched with `Wallet.fetch` and used for signing operations immediately.
 */
export declare class Wallet {
    static MAX_ADDRESSES: number;
    private model;
    private master?;
    private seed?;
    private addresses;
    private readonly addressPathPrefix;
    /**
     * Private constructor to prevent direct instantiation outside of factory method. Use Wallet.init instead.
     *
     * @ignore
     * @param model - The wallet model object.
     * @param master - The HD master key.
     * @param seed - The seed to use for the Wallet. Expects a 32-byte hexadecimal with no 0x prefix.
     * @hideconstructor
     */
    private constructor();
    /**
     * Lists the Wallets belonging to the CDP Project.
     *
     * @param options - The pagination options.
     * @param options.limit - The maximum number of Wallets to return. Limit can range between 1 and 100.
     * @param options.page - The cursor for pagination across multiple pages of Wallets. Don\&#39;t include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     *
     * @returns The paginated list response of Wallets.
     */
    static listWallets({ limit, page, }?: PaginationOptions): Promise<PaginationResponse<Wallet>>;
    /**
     * Fetches a Wallet by its ID. The returned wallet can be immediately used for signing operations if backed by a server signer.
     * If the wallet is not backed by a server signer, the wallet's seed will need to be set before it can be used for signing operations.
     *
     * @param wallet_id - The ID of the Wallet to fetch
     * @returns The fetched Wallet
     */
    static fetch(wallet_id: string): Promise<Wallet>;
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
    static import(data: WalletData | MnemonicSeedPhrase, networkId?: string): Promise<Wallet>;
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
    static create({ networkId, timeoutSeconds, intervalSeconds, }?: WalletCreateOptions): Promise<Wallet>;
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
    static createWithSeed({ seed, networkId, timeoutSeconds, intervalSeconds, }?: WalletCreateOptions): Promise<Wallet>;
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
    static init(model: WalletModel, seed?: string | undefined): Wallet;
    /**
     * Exports the Wallet's data to a WalletData object.
     *
     * @returns The Wallet's data.
     * @throws {APIError} - If the request fails.
     */
    export(): WalletData;
    /**
     * Creates a new Address in the Wallet.
     *
     * @returns The new Address.
     * @throws {APIError} - If the address creation fails.
     */
    createAddress(): Promise<Address>;
    /**
     * Set the seed for the Wallet.
     *
     * @param seed - The seed to use for the Wallet. Expects a 32-byte hexadecimal with no 0x prefix.
     * @throws {ArgumentError} If the seed is empty.
     * @throws {Error} If the seed is already set.
     */
    setSeed(seed: string): void;
    /**
     * Returns the WalletAddress with the given ID.
     *
     * @param addressId - The ID of the WalletAddress to retrieve.
     * @returns The WalletAddress.
     */
    getAddress(addressId: string): Promise<WalletAddress | undefined>;
    /**
     * Returns the list of Addresses in the Wallet.
     *
     * @returns The list of Addresses.
     */
    listAddresses(): Promise<WalletAddress[]>;
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
    createTrade(options: CreateTradeOptions): Promise<Trade>;
    /**
     * Get the stakeable balance for the supplied asset.
     *
     * @param asset_id - The asset to check the stakeable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the stakeable balance.
     * @throws {Error} if the default address is not found.
     * @returns The stakeable balance.
     */
    stakeableBalance(asset_id: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }): Promise<Decimal>;
    /**
     * Get the unstakeable balance for the supplied asset.
     *
     * @param asset_id - The asset to check the unstakeable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the unstakeable balance.
     * @throws {Error} if the default address is not found.
     * @returns The unstakeable balance.
     */
    unstakeableBalance(asset_id: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }): Promise<Decimal>;
    /**
     * Get the pending claimable balance for the supplied asset.
     *
     * @param asset_id - The asset to check pending claimable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the pending claimable balance.
     * @throws {Error} if the default address is not found.
     * @returns The pending claimable balance.
     */
    pendingClaimableBalance(asset_id: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }): Promise<Decimal>;
    /**
     * Get the claimable balance for the supplied asset.
     *
     * @param asset_id - The asset to check claimable balance for.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for getting the claimable balance.
     * @throws {Error} if the default address is not found.
     * @returns The claimable balance.
     */
    claimableBalance(asset_id: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }): Promise<Decimal>;
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
    stakingRewards(assetId: string, startTime?: string, endTime?: string, format?: StakingRewardFormat): Promise<StakingReward[]>;
    /**
     * Lists the historical staking balances for the address.
     *
     * @param assetId - The asset ID.
     * @param startTime - The start time.
     * @param endTime - The end time.
     * @throws {Error} if the default address is not found.
     * @returns The staking balances.
     */
    historicalStakingBalances(assetId: string, startTime?: string, endTime?: string): Promise<StakingBalance[]>;
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
    listHistoricalBalances(assetId: string, { limit, page }?: PaginationOptions): Promise<PaginationResponse<HistoricalBalance>>;
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
    createStake(amount: Amount, assetId: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }, timeoutSeconds?: number, intervalSeconds?: number): Promise<StakingOperation>;
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
    createUnstake(amount: Amount, assetId: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }, timeoutSeconds?: number, intervalSeconds?: number): Promise<StakingOperation>;
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
    createClaimStake(amount: Amount, assetId: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }, timeoutSeconds?: number, intervalSeconds?: number): Promise<StakingOperation>;
    /**
     * Returns the list of balances of this Wallet. Balances are aggregated across all Addresses in the Wallet.
     *
     * @returns The list of balances. The key is the Asset ID, and the value is the balance.
     */
    listBalances(): Promise<BalanceMap>;
    /**
     * Returns the balance of the provided Asset. Balances are aggregated across all Addresses in the Wallet.
     *
     * @param assetId - The ID of the Asset to retrieve the balance for.
     * @returns The balance of the Asset.
     */
    getBalance(assetId: string): Promise<Decimal>;
    /**
     * Returns the Network ID of the Wallet.
     *
     * @returns The network ID.
     */
    getNetworkId(): string;
    /**
     * Returns the ServerSigner Status of the Wallet.
     *
     * @returns the ServerSigner Status.
     */
    getServerSignerStatus(): ServerSignerStatus | undefined;
    /**
     * Returns the wallet ID.
     *
     * @returns The wallet ID.
     */
    getId(): string | undefined;
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
    saveSeed(filePath: string, encrypt?: boolean): string;
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
    saveSeedToFile(filePath: string, encrypt?: boolean): string;
    /**
     * Loads the seed of the Wallet from the given file.
     *
     * @deprecated Use loadSeedFromFile() instead
     * @param filePath - The path of the file to load the seed from
     * @returns A string indicating the success of the operation
     */
    loadSeed(filePath: string): Promise<string>;
    /**
     * Loads the seed of the Wallet from the given file.
     *
     * @param filePath - The path of the file to load the seed from
     * @returns A string indicating the success of the operation
     */
    loadSeedFromFile(filePath: string): Promise<string>;
    /**
     * Returns the default address of the Wallet.
     *
     * @returns The default address
     */
    getDefaultAddress(): Promise<WalletAddress>;
    /**
     * Returns whether the Wallet has a seed with which to derive keys and sign transactions.
     *
     * @returns Whether the Wallet has a seed with which to derive keys and sign transactions.
     */
    canSign(): boolean;
    /**
     * Requests funds from the faucet for the Wallet's default address and returns the faucet transaction.
     * This is only supported on testnet networks.
     *
     * @param assetId - The ID of the Asset to request from the faucet.
     * @throws {Error} If the default address is not found.
     * @throws {APIError} If the request fails.
     * @returns The successful faucet transaction
     */
    faucet(assetId?: string): Promise<FaucetTransaction>;
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
    createTransfer(options: CreateTransferOptions): Promise<Transfer>;
    /**
     * Creates a Payload Signature.
     *
     * @param unsignedPayload - The Unsigned Payload to sign.
     * @returns A promise that resolves to the Payload Signature object.
     * @throws {APIError} if the API request to create a Payload Signature fails.
     * @throws {Error} if the default address is not found.
     */
    createPayloadSignature(unsignedPayload: string): Promise<PayloadSignature>;
    /**
     * Creates a Webhook for a wallet, monitors all wallet addresses for onchain events.
     *
     * @param notificationUri - The URI to which the webhook notifications will be sent.
     *
     * @returns The newly created webhook instance.
     */
    createWebhook(notificationUri: string): Promise<Webhook>;
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
    invokeContract(options: CreateContractInvocationOptions): Promise<ContractInvocation>;
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
    deployToken(options: CreateERC20Options): Promise<SmartContract>;
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
    deployNFT(options: CreateERC721Options): Promise<SmartContract>;
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
    deployMultiToken(options: CreateERC1155Options): Promise<SmartContract>;
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
    deployContract(options: CreateCustomContractOptions): Promise<SmartContract>;
    /**
     * Fund the wallet from your account on the Coinbase Platform.
     *
     * @param options - The options to create the fund operation
     * @param options.amount - The amount of the Asset to fund the wallet with
     * @param options.assetId - The ID of the Asset to fund with. For Ether, eth, gwei, and wei are supported.
     * @returns The created fund operation object
     * @throws {Error} If the default address does not exist
     */
    fund(options: CreateFundOptions): Promise<FundOperation>;
    /**
     * Get a quote for funding the wallet from your Coinbase platform account.
     *
     * @param options - The options to create the fund quote
     * @param options.amount - The amount to fund
     * @param options.assetId - The ID of the Asset to fund with. For Ether, eth, gwei, and wei are supported.
     * @returns The fund quote object
     * @throws {Error} If the default address does not exist
     */
    quoteFund(options: CreateQuoteOptions): Promise<FundQuote>;
    /**
     * Returns all the fund operations associated with the wallet's default address.
     *
     * @param options - The pagination options.
     * @param options.limit - The maximum number of fund operations to return. Limit can range between 1 and 100.
     * @param options.page - The cursor for pagination across multiple pages of fund operations. Don't include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     * @returns The paginated list response of fund operations.
     * @throws {Error} If the default address does not exist
     */
    listFundOperations({ limit, page, }?: PaginationOptions): Promise<PaginationResponse<FundOperation>>;
    /**
     * Returns a String representation of the Wallet.
     *
     * @returns a String representation of the Wallet
     */
    toString(): string;
    /**
     * Validates the seed and address models passed to the constructor.
     *
     * @param seed - The seed to use for the Wallet
     */
    private validateSeed;
    /**
     * Loads the seed data from the given file.
     *
     * @param filePath - The path of the file to load the seed data from
     * @returns The seed data
     */
    private getExistingSeeds;
    /**
     * Gets the key for encrypting seed data.
     *
     * For EC keys (PEM format), it uses crypto.diffieHellman.
     * For Ed25519 keys (assumed to be a base64-encoded 64-byte string), it converts the secret key
     * to an X25519 key using ed2curve.
     *
     * @returns The encryption key.
     */
    private getEncryptionKey;
    /**
     * Returns a WalletAddress object for the given AddressModel.
     *
     * @param addressModel - The AddressModel to build the WalletAddress from.
     * @param index - The index of the AddressModel.
     * @returns The WalletAddress object.
     */
    private buildWalletAddress;
    /**
     * Waits until the ServerSigner has created a seed for the Wallet.
     *
     * @param walletId - The ID of the Wallet that is awaiting seed creation.
     * @param intervalSeconds - The interval at which to poll the CDPService, in seconds.
     * @param timeoutSeconds - The maximum amount of time to wait for the ServerSigner to create a seed, in seconds.
     * @throws {APIError} if the API request to get a Wallet fails.
     * @throws {Error} if the ServerSigner times out.
     */
    private waitForSigner;
    /**
     * Sets the master node for the given seed, if valid. If the seed is undefined it will set the master node using a random seed.
     *
     * @param seed - The seed to use for the Wallet.
     * @returns The master node for the given seed.
     */
    private setMasterNode;
    /**
     * Derives a key for an already registered Address in the Wallet.
     *
     * @param index - The index of the Address to derive.
     * @throws {Error} - If the key derivation fails.
     * @returns The derived key.
     */
    private deriveKey;
    /**
     * Creates an attestation for the Address currently being created.
     *
     * @param key - The key of the Wallet.
     * @returns The attestation.
     */
    private createAttestation;
    /**
     * Reloads the Wallet model with the latest data from the server.
     *
     * @throws {APIError} if the API request to get a Wallet fails.
     */
    private reload;
}
