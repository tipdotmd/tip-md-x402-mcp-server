import { ethers } from "ethers";
import { SmartContract as SmartContractModel } from "../client/api";
import { Transaction } from "./transaction";
import { SmartContractOptions, SmartContractType, RegisterContractOptions, PaginationOptions, PaginationResponse, UpdateContractOptions } from "./types";
import { ContractEvent } from "./contract_event";
/**
 * A representation of a SmartContract on the blockchain.
 */
export declare class SmartContract {
    private model;
    /**
     * Creates a new SmartContract instance.
     *
     * @param contractModel - The SmartContract model from the API.
     */
    constructor(contractModel: SmartContractModel);
    /**
     * Returns whether the SmartContract is external.
     *
     * @returns True if the SmartContract is external, false otherwise.
     */
    get isExternal(): boolean;
    /**
     * Returns a list of ContractEvents for the provided network, contract, and event details.
     *
     * @param networkId - The network ID.
     * @param protocolName - The protocol name.
     * @param contractAddress - The contract address.
     * @param contractName - The contract name.
     * @param eventName - The event name.
     * @param fromBlockHeight - The start block height.
     * @param toBlockHeight - The end block height.
     * @returns The contract events.
     */
    static listEvents(networkId: string, protocolName: string, contractAddress: string, contractName: string, eventName: string, fromBlockHeight: number, toBlockHeight: number): Promise<ContractEvent[]>;
    /**
     * Register a smart contract.
     *
     * @param options - The options to register a smart contract.
     * @param options.networkId - The network ID.
     * @param options.contractAddress - The contract address.
     * @param options.abi - The ABI of the contract.
     * @param options.contractName - The contract name.
     * @returns The smart contract.
     */
    static register({ networkId, contractAddress, abi, contractName, }: RegisterContractOptions): Promise<SmartContract>;
    /**
     * Lists Smart Contracts.
     *
     * @param options - The pagination options.
     * @param options.page - The cursor for pagination across multiple pages of Smart Contract. Don\&#39;t include this parameter on the first call. Use the next page value returned in a previous response to request subsequent results.
     *
     * @returns The paginated list response of Smart Contracts.
     */
    static list({ page }?: PaginationOptions): Promise<PaginationResponse<SmartContract>>;
    /**
     * Converts a SmartContractModel into a SmartContract object.
     *
     * @param contractModel - The SmartContract model object.
     * @returns The SmartContract object.
     */
    static fromModel(contractModel: SmartContractModel): SmartContract;
    /**
     * Returns the ID of the SmartContract.
     *
     * @returns The SmartContract ID.
     */
    getId(): string;
    /**
     * Returns the Network ID of the SmartContract.
     *
     * @returns The Network ID.
     */
    getNetworkId(): string;
    /**
     * Returns the Wallet ID that deployed the smart contract.
     *
     * @returns The Wallet ID.
     */
    getWalletId(): string | undefined;
    /**
     * Returns the name of the smart contract.
     *
     * @returns The contract name.
     */
    getContractName(): string;
    /**
     * Returns the Contract Address of the smart contract.
     *
     * @returns The Contract Address.
     */
    getContractAddress(): string;
    /**
     * Returns the Deployer Address of the smart contract.
     *
     * @returns The Deployer Address.
     */
    getDeployerAddress(): string | undefined;
    /**
     * Returns the Type of the smart contract.
     *
     * @returns The Smart Contract Type.
     */
    getType(): SmartContractType;
    /**
     * Returns the Options of the smart contract.
     *
     * @returns The Smart Contract Options.
     */
    getOptions(): SmartContractOptions;
    /**
     * Returns the ABI of the smart contract.
     *
     * @returns The ABI as a JSON-encoded string.
     */
    getAbi(): object;
    /**
     * Returns the Transaction of the smart contract deployment.
     *
     * @returns The Transaction.
     */
    getTransaction(): Transaction | undefined;
    /**
     * Signs the SmartContract deployment with the provided key and returns the hex signature
     * required for broadcasting the SmartContract deployment.
     *
     * @param key - The key to sign the SmartContract deployment with
     * @returns The hex-encoded signed payload
     */
    sign(key: ethers.Wallet): Promise<string>;
    /**
     * Update a smart contract.
     *
     * @param options - The options to update a smart contract.
     * @param options.abi - The new ABI of the contract.
     * @param options.contractName - The new contract name.
     * @returns The smart contract.
     */
    update({ abi, contractName }: UpdateContractOptions): Promise<SmartContract>;
    /**
     * Broadcasts the SmartContract deployment to the Network.
     *
     * @returns The SmartContract object
     * @throws {APIError} if the API request to broadcast a SmartContract deployment fails.
     */
    broadcast(): Promise<SmartContract>;
    /**
     * Waits for the SmartContract deployment to be confirmed on the Network or fail on chain.
     * Waits until the SmartContract deployment is completed or failed on-chain by polling at the given interval.
     * Raises an error if the SmartContract deployment takes longer than the given timeout.
     *
     * @param options - The options to configure the wait function.
     * @param options.intervalSeconds - The interval to check the status of the SmartContract deployment.
     * @param options.timeoutSeconds - The maximum time to wait for the SmartContract deployment to be confirmed.
     *
     * @returns The SmartContract object in a terminal state.
     * @throws {Error} if the SmartContract deployment times out.
     */
    wait({ intervalSeconds, timeoutSeconds }?: {
        intervalSeconds?: number | undefined;
        timeoutSeconds?: number | undefined;
    }): Promise<SmartContract>;
    /**
     * Reloads the SmartContract model with the latest data from the server.
     *
     * @throws {APIError} if the API request to get a SmartContract fails.
     */
    reload(): Promise<void>;
    /**
     * Returns a string representation of the SmartContract.
     *
     * @returns The string representation of the SmartContract.
     */
    toString(): string;
    /**
     * Type guard for checking if the smart contract is an ERC20.
     *
     * @param type - The type of the smart contract.
     * @param options - The options of the smart contract.
     * @returns True if the smart contract is an ERC20, false otherwise.
     */
    private isERC20;
    /**
     * Type guard for checking if the smart contract is an ERC721.
     *
     * @param type - The type of the smart contract.
     * @param options - The options of the smart contract.
     * @returns True if the smart contract is an ERC721, false otherwise.
     */
    private isERC721;
    /**
     * Type guard for checking if the smart contract is an ERC1155.
     *
     * @param type - The type of the smart contract.
     * @param options - The options of the smart contract.
     * @returns True if the smart contract is an ERC1155, false otherwise.
     */
    private isERC1155;
}
