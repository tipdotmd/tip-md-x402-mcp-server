"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAIN_ID_TO_NETWORK_ID = void 0;
const api_1 = require("../client/api");
/**
 * Maps chain IDs to their corresponding Coinbase network IDs. Only SmartWallet related chains are listed here right now.
 */
exports.CHAIN_ID_TO_NETWORK_ID = {
    8453: api_1.NetworkIdentifier.BaseMainnet,
    84532: api_1.NetworkIdentifier.BaseSepolia,
};
