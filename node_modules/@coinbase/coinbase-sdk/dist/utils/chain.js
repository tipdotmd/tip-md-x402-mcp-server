"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNetwork = void 0;
const chain_1 = require("../types/chain");
/**
 * Creates a network configuration for a given chain ID
 * @param chainId - The chain ID to create a network configuration for
 * @returns The network configuration
 */
function createNetwork(chainId) {
    return {
        chainId,
        networkId: chain_1.CHAIN_ID_TO_NETWORK_ID[chainId],
    };
}
exports.createNetwork = createNetwork;
