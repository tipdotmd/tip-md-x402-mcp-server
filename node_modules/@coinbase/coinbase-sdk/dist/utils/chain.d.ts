import { SupportedChainId, Network } from "../types/chain";
/**
 * Creates a network configuration for a given chain ID
 * @param chainId - The chain ID to create a network configuration for
 * @returns The network configuration
 */
export declare function createNetwork(chainId: SupportedChainId): Network;
