import { ethers } from "ethers";
import { Address as AddressModel } from "../../client";
import { Address } from "../address";
import { Trade } from "../trade";
import { Transfer } from "../transfer";
import { ContractInvocation } from "../contract_invocation";
import { Amount, CreateContractInvocationOptions, CreateCustomContractOptions, CreateERC1155Options, CreateERC20Options, CreateERC721Options, CreateFundOptions, CreateQuoteOptions, CreateTradeOptions, CreateTransferOptions, PaginationOptions, PaginationResponse, StakeOptionsMode } from "../types";
import { StakingOperation } from "../staking_operation";
import { PayloadSignature } from "../payload_signature";
import { SmartContract } from "../smart_contract";
import { FundOperation } from "../fund_operation";
import { FundQuote } from "../fund_quote";
/**
 * A representation of a blockchain address, which is a wallet-controlled account on a network.
 */
export declare class WalletAddress extends Address {
    private model;
    private key?;
    /**
     * Initializes a new Wallet Address instance.
     *
     * @param model - The address model data.
     * @param key - The ethers.js SigningKey the Address uses to sign data.
     * @throws {Error} If the address model is empty.
     */
    constructor(model: AddressModel, key?: ethers.Wallet);
    /**
     * Returns a string representation of the wallet address.
     *
     * @returns A string representing the wallet address.
     */
    toString(): string;
    /**
     * Returns the wallet ID.
     *
     * @returns The wallet ID.
     */
    getWalletId(): string;
    /**
     * Sets the private key.
     *
     * @param key - The ethers.js SigningKey the Address uses to sign data.
     * @throws {Error} If the private key is already set.
     */
    setKey(key: ethers.Wallet): void;
    /**
     * Exports the Address's private key to a hex string.
     *
     * @returns The Address's private key as a hex string.
     */
    export(): string;
    /**
     * Returns whether the Address has a private key backing it to sign transactions.
     *
     * @returns Whether the Address has a private key backing it to sign transactions.
     */
    canSign(): boolean;
    /**
     * Returns all the trades associated with the address.
     *
     * @param options - The pagination options.
     * @param options.limit - The maximum number of Trades to return. Limit can range between 1 and 100.
     * @param options.page - The cursor for pagination across multiple pages of Trades. Don\&#39;t include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     *
     * @returns The paginated list response of trades.
     */
    listTrades({ limit, page, }?: PaginationOptions): Promise<PaginationResponse<Trade>>;
    /**
     * Returns all the transfers associated with the address.
     *
     * @param options - The pagination options.
     * @param options.limit - The maximum number of Transfers to return. Limit can range between 1 and 100.
     * @param options.page - The cursor for pagination across multiple pages of Transfers. Don\&#39;t include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     *
     * @returns The paginated list response of transfers.
     */
    listTransfers({ limit, page, }?: PaginationOptions): Promise<PaginationResponse<Transfer>>;
    /**
     * Transfers the given amount of the given Asset to the given address.
     * Only same-Network Transfers are supported.
     * This returns a `Transfer` object that has been signed and broadcasted, you
     * can wait for this to land on-chain (or fail) by calling `transfer.wait()`.
     *
     * @param options - The options to create the Transfer.
     * @param options.amount - The amount of the Asset to send.
     * @param options.assetId - The ID of the Asset to send. For Ether, Coinbase.assets.Eth, Coinbase.assets.Gwei, and Coinbase.assets.Wei supported.
     * @param options.destination - The destination of the transfer. If a Wallet, sends to the Wallet's default address. If a String, interprets it as the address ID.
     * @param options.gasless - Whether the Transfer should be gasless. Defaults to false.
     * @param options.skipBatching - When true, the Transfer will be submitted immediately. Otherwise, the Transfer will be batched. Defaults to false. Note: requires gasless option to be set to true.
     * @returns The transfer object.
     * @throws {APIError} if the API request to create a Transfer fails.
     * @throws {APIError} if the API request to broadcast a Transfer fails.
     */
    createTransfer({ amount, assetId, destination, gasless, skipBatching, }: CreateTransferOptions): Promise<Transfer>;
    /**
     * Gets a signer for the private key.
     *
     * @returns The signer for the private key.
     * @throws {Error} If the private key is not loaded.
     */
    private getSigner;
    /**
     * Trades the given amount of the given Asset for another Asset. Only same-network Trades are supported.
     *
     * @param options - The options to create the Trade.
     * @param options.amount - The amount of the From Asset to send.
     * @param options.fromAssetId - The ID of the Asset to trade from.
     * @param options.toAssetId - The ID of the Asset to trade to.
     * @returns The Trade object.
     * @throws {APIError} if the API request to create or broadcast a Trade fails.
     * @throws {Error} if the Trade times out.
     */
    createTrade({ amount, fromAssetId, toAssetId }: CreateTradeOptions): Promise<Trade>;
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
     * @throws {Error} if the address cannot sign.
     * @throws {ArgumentError} if the address does not have sufficient balance.
     */
    invokeContract({ contractAddress, method, abi, args, amount, assetId, }: CreateContractInvocationOptions): Promise<ContractInvocation>;
    /**
     * Deploys an ERC20 token contract.
     *
     * @param options - The options for creating the ERC20 token.
     * @param options.name - The name of the ERC20 token.
     * @param options.symbol - The symbol of the ERC20 token.
     * @param options.totalSupply - The total supply of the ERC20 token.
     * @returns A Promise that resolves to the deployed SmartContract object.
     * @throws {APIError} If the API request to create a smart contract fails.
     */
    deployToken({ name, symbol, totalSupply, }: CreateERC20Options): Promise<SmartContract>;
    /**
     * Deploys an ERC721 token contract.
     *
     * @param options - The options for creating the ERC721 token.
     * @param options.name - The name of the ERC721 token.
     * @param options.symbol - The symbol of the ERC721 token.
     * @param options.baseURI - The base URI of the ERC721 token.
     * @returns A Promise that resolves to the deployed SmartContract object.
     * @throws {APIError} If the API request to create a smart contract fails.
     */
    deployNFT({ name, symbol, baseURI }: CreateERC721Options): Promise<SmartContract>;
    /**
     * Deploys an ERC1155 multi-token contract.
     *
     * @param options - The options for creating the ERC1155 token.
     * @param options.uri - The URI for all token metadata.
     * @returns A Promise that resolves to the deployed SmartContract object.
     * @throws {APIError} If the API request to create a smart contract fails.
     */
    deployMultiToken({ uri }: CreateERC1155Options): Promise<SmartContract>;
    /**
     * Deploys a custom contract.
     *
     * @param options - The options for creating the custom contract.
     * @param options.solidityVersion - The version of the solidity compiler, must be 0.8.+, such as "0.8.28+commit.7893614a". See https://binaries.soliditylang.org/bin/list.json
     * @param options.solidityInputJson - The input json for the solidity compiler. See https://docs.soliditylang.org/en/latest/using-the-compiler.html#input-description for more details.
     * @param options.contractName - The name of the contract class to be deployed.
     * @param options.constructorArgs - The arguments for the constructor.
     * @returns A Promise that resolves to the deployed SmartContract object.
     * @throws {APIError} If the API request to create a smart contract fails.
     */
    deployContract({ solidityVersion, solidityInputJson, contractName, constructorArgs, }: CreateCustomContractOptions): Promise<SmartContract>;
    /**
     * Creates an ERC20 token contract.
     *
     * @private
     * @param {CreateERC20Options} options - The options for creating the ERC20 token.
     * @param {string} options.name - The name of the ERC20 token.
     * @param {string} options.symbol - The symbol of the ERC20 token.
     * @param {BigNumber} options.totalSupply - The total supply of the ERC20 token.
     * @returns {Promise<SmartContract>} A Promise that resolves to the created SmartContract.
     * @throws {APIError} If the API request to create a smart contract fails.
     */
    private createERC20;
    /**
     * Creates an ERC721 token contract.
     *
     * @param options - The options for creating the ERC721 token.
     * @param options.name - The name of the ERC721 token.
     * @param options.symbol - The symbol of the ERC721 token.
     * @param options.baseURI - The base URI of the ERC721 token.
     * @returns A Promise that resolves to the deployed SmartContract object.
     * @throws {APIError} If the private key is not loaded when not using server signer.
     */
    private createERC721;
    /**
     * Creates an ERC1155 multi-token contract.
     *
     * @private
     * @param {CreateERC1155Options} options - The options for creating the ERC1155 token.
     * @param {string} options.uri - The URI for all token metadata.
     * @returns {Promise<SmartContract>} A Promise that resolves to the created SmartContract.
     * @throws {APIError} If the API request to create a smart contract fails.
     */
    private createERC1155;
    /**
     * Creates a custom contract.
     *
     * @private
     * @param {CreateCustomContractOptions} options - The options for creating the custom contract.
     * @param {string} options.solidityVersion - The version of the solidity compiler, must be 0.8.+, such as "0.8.28+commit.7893614a". See https://binaries.soliditylang.org/bin/list.json
     * @param {string} options.solidityInputJson - The input json for the solidity compiler. See https://docs.soliditylang.org/en/latest/using-the-compiler.html#input-description for more details.
     * @param {string} options.contractName - The name of the contract class.
     * @param {Record<string, any>} options.constructorArgs - The arguments for the constructor.
     * @returns {Promise<SmartContract>} A Promise that resolves to the created SmartContract.
     * @throws {APIError} If the API request to compile or subsequently create a smart contract fails.
     */
    private createCustomContract;
    /**
     * Creates a contract invocation with the given data.
     *
     * @param contractAddress - The address of the contract the method will be invoked on.
     * @param method - The method to invoke on the contract.
     * @param abi - The ABI of the contract.
     * @param args - The arguments to pass to the contract method invocation.
     *   The keys should be the argument names and the values should be the argument values.
     * @param atomicAmount - The atomic amount of the native asset to send to a payable contract method.
     * @returns The ContractInvocation object.
     * @throws {APIError} if the API request to create a contract invocation fails.
     */
    private createContractInvocation;
    /**
     * Creates a staking operation to stake.
     *
     * @param amount - The amount to stake.
     * @param assetId - The asset to stake.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for the stake operation:
     *
     * A. Shared ETH Staking
     *  - `integrator_contract_address` (optional): The contract address to which the stake operation is directed to. Defaults to the integrator contract address associated with CDP account (if available) or else defaults to a shared integrator contract address for that network.
     *
     * B. Dedicated ETH Staking
     *  - `funding_address` (optional): Ethereum address for funding the stake operation. Defaults to the address initiating the stake operation.
     *  - `withdrawal_address` (optional): Ethereum address for receiving rewards and withdrawal funds. Defaults to the address initiating the stake operation.
     *  - `fee_recipient_address` (optional): Ethereum address for receiving transaction fees. Defaults to the address initiating the stake operation.
     *
     * @param timeoutSeconds - The amount to wait for the transaction to complete when broadcasted.
     * @param intervalSeconds - The amount to check each time for a successful broadcast.
     * @returns The staking operation after it's completed successfully.
     */
    createStake(amount: Amount, assetId: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }, timeoutSeconds?: number, intervalSeconds?: number): Promise<StakingOperation>;
    /**
     * Creates a staking operation to unstake.
     *
     * @param amount - The amount to unstake.
     * @param assetId - The asset to unstake.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for the unstake operation:
     *
     * A. Shared ETH Staking
     *  - `integrator_contract_address` (optional): The contract address to which the unstake operation is directed to. Defaults to the integrator contract address associated with CDP account (if available) or else defaults to a shared integrator contract address for that network.
     *
     * B. Dedicated ETH Staking
     *  - `immediate` (optional): Set this to "true" to unstake immediately i.e. leverage "Coinbase managed unstake" process . Defaults to "false" i.e. "User managed unstake" process.
     *  - `validator_pub_keys` (optional): List of comma separated validator public keys to unstake. Defaults to validators being picked up on your behalf corresponding to the unstake amount.
     *
     * @param timeoutSeconds - The amount to wait for the transaction to complete when broadcasted.
     * @param intervalSeconds - The amount to check each time for a successful broadcast.
     * @returns The staking operation after it's completed successfully.
     */
    createUnstake(amount: Amount, assetId: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }, timeoutSeconds?: number, intervalSeconds?: number): Promise<StakingOperation>;
    /**
     * Creates a staking operation to claim stake.
     *
     * @param amount - The amount to claim stake.
     * @param assetId - The asset to claim stake.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options for the claim stake operation.
     *
     * A. Shared ETH Staking
     *  - `integrator_contract_address` (optional): The contract address to which the claim stake operation is directed to. Defaults to the integrator contract address associated with CDP account (if available) or else defaults to a shared integrator contract address for that network.
     *
     * @param timeoutSeconds - The amount to wait for the transaction to complete when broadcasted.
     * @param intervalSeconds - The amount to check each time for a successful broadcast.
     * @returns The staking operation after it's completed successfully.
     */
    createClaimStake(amount: Amount, assetId: string, mode?: StakeOptionsMode, options?: {
        [key: string]: string;
    }, timeoutSeconds?: number, intervalSeconds?: number): Promise<StakingOperation>;
    /**
     * Creates a staking operation to consolidate.
     *
     * @param options - Additional options for the consolidation operation.
     *
     * @param timeoutSeconds - The amount to wait for the transaction to complete when broadcasted.
     * @param intervalSeconds - The amount to check each time for a successful broadcast.
     *
     * @returns The staking operation after it's completed successfully.
     */
    createValidatorConsolidation(options?: {
        [key: string]: string;
    }, timeoutSeconds?: number, intervalSeconds?: number): Promise<StakingOperation>;
    /**
     * Creates a Payload Signature.
     *
     * @param unsignedPayload - The Unsigned Payload to sign.
     * @returns A promise that resolves to the Payload Signature object.
     * @throws {APIError} if the API request to create a Payload Signature fails.
     * @throws {Error} if the address does not have a private key loaded or an associated Server-Signer.
     */
    createPayloadSignature(unsignedPayload: string): Promise<PayloadSignature>;
    /**
     * Gets a Payload Signature.
     *
     * @param payloadSignatureId - The ID of the Payload Signature to fetch.
     * @returns A promise that resolves to the Payload Signature object.
     * @throws {APIError} if the API request to get the Payload Signature fails.
     */
    getPayloadSignature(payloadSignatureId: string): Promise<PayloadSignature>;
    /**
     * Lists all the Payload Signatures associated with the Address.
     *
     * @param options - The pagination options.
     * @param options.limit - The maximum number of Payload Signatures to return. Limit can range between 1 and 100.
     * @param options.page - The cursor for pagination across multiple pages of Payload Signatures. Don\&#39;t include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     *
     * @returns A promise that resolves to the paginated list response of Payload Signatures.
     * @throws {APIError} if the API request to list the Payload Signatures fails.
     */
    listPayloadSignatures({ limit, page, }?: PaginationOptions): Promise<PaginationResponse<PayloadSignature>>;
    /**
     * Fund the address from your account on the Coinbase Platform.
     *
     * @param options - The options to create the fund operation
     * @param options.amount - The amount of the Asset to fund the wallet with
     * @param options.assetId - The ID of the Asset to fund with. For Ether, eth, gwei, and wei are supported.
     * @returns The created fund operation object
     */
    fund({ amount, assetId }: CreateFundOptions): Promise<FundOperation>;
    /**
     * Get a quote for funding the address from your Coinbase platform account.
     *
     * @param options - The options to create the fund quote
     * @param options.amount - The amount to fund
     * @param options.assetId - The ID of the Asset to fund with. For Ether, eth, gwei, and wei are supported.
     * @returns The fund quote object
     */
    quoteFund({ amount, assetId }: CreateQuoteOptions): Promise<FundQuote>;
    /**
     * Returns all the fund operations associated with the address.
     *
     * @param options - The pagination options.
     * @param options.limit - The maximum number of Fund Operations to return. Limit can range between 1 and 100.
     * @param options.page - The cursor for pagination across multiple pages of Fund Operations. Don't include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     *
     * @returns The paginated list response of fund operations.
     */
    listFundOperations({ limit, page, }?: PaginationOptions): Promise<PaginationResponse<FundOperation>>;
    /**
     * Returns the address and network ID of the given destination.
     *
     * @param destination - The destination to get the address and network ID of.
     * @returns The address and network ID of the destination.
     */
    private getDestinationAddressAndNetwork;
    /**
     * Creates a trade model for the specified amount and assets.
     *
     * @param amount - The amount of the Asset to send.
     * @param fromAsset - The Asset to trade from.
     * @param toAsset - The Asset to trade to.
     * @returns A promise that resolves to a Trade object representing the new trade.
     */
    private createTradeRequest;
    /**
     * Checks if trading is possible and raises an error if not.
     *
     * @param amount - The amount of the Asset to send.
     * @param fromAssetId - The ID of the Asset to trade from. For Ether, eth, gwei, and wei are supported.
     * @throws {Error} If the private key is not loaded, or if the asset IDs are unsupported, or if there are insufficient funds.
     */
    private validateCanTrade;
    /**
     * Creates a staking operation to stake, signs it, and broadcasts it on the blockchain.
     *
     * @param amount - The amount for the staking operation.
     * @param assetId - The asset to the staking operation.
     * @param action - The type of staking action to perform.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options such as setting the mode for the staking action.
     * @param timeoutSeconds - The amount to wait for the transaction to complete when broadcasted.
     * @param intervalSeconds - The amount to check each time for a successful broadcast.
     * @throws {APIError} if the API request to create or broadcast staking operation fails.
     * @throws {Error} if the amount is less than zero.
     * @returns The staking operation after it's completed fully.
     */
    private createStakingOperation;
    /**
     * A helper function that creates the staking operation.
     *
     * @param amount - The amount for the staking operation.
     * @param assetId - The asset for the staking operation.
     * @param action - The type of staking action to perform.
     * @param mode - The staking mode. Defaults to DEFAULT.
     * @param options - Additional options such as setting the mode for the staking action.
     * @private
     * @throws {APIError} if the API request to create staking operation fails.
     * @returns The created staking operation.
     */
    private createStakingOperationRequest;
    /**
     * A helper function that broadcasts the signed payload.
     *
     * @param stakingOperationID - The staking operation id related to the signed payload.
     * @param signedPayload - The payload that's being broadcasted.
     * @param transactionIndex - The index of the transaction in the array from the staking operation.
     * @private
     * @returns An updated staking operation with the broadcasted transaction.
     */
    private broadcastStakingOperationRequest;
}
