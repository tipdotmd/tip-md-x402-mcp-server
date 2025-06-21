"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartContractType = exports.StakeOptionsMode = exports.ServerSignerStatus = exports.isMnemonicSeedPhrase = exports.isWalletData = exports.FundOperationStatus = exports.PayloadSignatureStatus = exports.StakingRewardFormat = exports.ValidatorStatus = exports.SponsoredSendStatus = exports.TransactionStatus = exports.TransferStatus = void 0;
/**
 * Transfer status type definition.
 */
var TransferStatus;
(function (TransferStatus) {
    TransferStatus["PENDING"] = "pending";
    TransferStatus["BROADCAST"] = "broadcast";
    TransferStatus["COMPLETE"] = "complete";
    TransferStatus["FAILED"] = "failed";
})(TransferStatus || (exports.TransferStatus = TransferStatus = {}));
/**
 * Transaction status type definition.
 */
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["SIGNED"] = "signed";
    TransactionStatus["BROADCAST"] = "broadcast";
    TransactionStatus["COMPLETE"] = "complete";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["UNSPECIFIED"] = "unspecified";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
/**
 * Sponsored Send status type definition.
 */
var SponsoredSendStatus;
(function (SponsoredSendStatus) {
    SponsoredSendStatus["PENDING"] = "pending";
    SponsoredSendStatus["SIGNED"] = "signed";
    SponsoredSendStatus["SUBMITTED"] = "submitted";
    SponsoredSendStatus["COMPLETE"] = "complete";
    SponsoredSendStatus["FAILED"] = "failed";
})(SponsoredSendStatus || (exports.SponsoredSendStatus = SponsoredSendStatus = {}));
/**
 * Validator status type definition.
 * Represents the various states a validator can be in.
 */
var ValidatorStatus;
(function (ValidatorStatus) {
    ValidatorStatus["UNKNOWN"] = "unknown";
    ValidatorStatus["PROVISIONING"] = "provisioning";
    ValidatorStatus["PROVISIONED"] = "provisioned";
    ValidatorStatus["DEPOSITED"] = "deposited";
    ValidatorStatus["PENDING_ACTIVATION"] = "pending_activation";
    ValidatorStatus["ACTIVE"] = "active";
    ValidatorStatus["EXITING"] = "exiting";
    ValidatorStatus["EXITED"] = "exited";
    ValidatorStatus["WITHDRAWAL_AVAILABLE"] = "withdrawal_available";
    ValidatorStatus["WITHDRAWAL_COMPLETE"] = "withdrawal_complete";
    ValidatorStatus["ACTIVE_SLASHED"] = "active_slashed";
    ValidatorStatus["EXITED_SLASHED"] = "exited_slashed";
    ValidatorStatus["REAPED"] = "reaped";
})(ValidatorStatus || (exports.ValidatorStatus = ValidatorStatus = {}));
/**
 * Staking reward format type definition.
 * Represents the format in which staking rewards can be queried.
 */
var StakingRewardFormat;
(function (StakingRewardFormat) {
    StakingRewardFormat["USD"] = "usd";
    StakingRewardFormat["NATIVE"] = "native";
})(StakingRewardFormat || (exports.StakingRewardFormat = StakingRewardFormat = {}));
/**
 * Payload Signature status type definition.
 */
var PayloadSignatureStatus;
(function (PayloadSignatureStatus) {
    PayloadSignatureStatus["PENDING"] = "pending";
    PayloadSignatureStatus["SIGNED"] = "signed";
    PayloadSignatureStatus["FAILED"] = "failed";
})(PayloadSignatureStatus || (exports.PayloadSignatureStatus = PayloadSignatureStatus = {}));
/**
 * Fund Operation status type definition.
 */
var FundOperationStatus;
(function (FundOperationStatus) {
    FundOperationStatus["PENDING"] = "pending";
    FundOperationStatus["COMPLETE"] = "complete";
    FundOperationStatus["FAILED"] = "failed";
})(FundOperationStatus || (exports.FundOperationStatus = FundOperationStatus = {}));
/**
 * Type guard to check if data matches the appropriate WalletData format.
 * WalletData must have:
 * - exactly one of (walletId or wallet_id)
 * - at most one of (networkId or network_id)
 * - a seed
 *
 * @param data - The data to check
 * @returns True if data matches the appropriate WalletData format
 */
function isWalletData(data) {
    if (typeof data !== "object" || data === null) {
        return false;
    }
    const { walletId, wallet_id, networkId, network_id, seed } = data;
    // Check that exactly one of walletId or wallet_id is present (but not both)
    const hasWalletId = typeof walletId === "string";
    const hasWalletSnakeId = typeof wallet_id === "string";
    if (!(hasWalletId !== hasWalletSnakeId)) {
        return false;
    }
    // Check that at most one of networkId or network_id is present (but not both)
    const hasNetworkId = typeof networkId === "string";
    const hasNetworkSnakeId = typeof network_id === "string";
    if (hasNetworkId && hasNetworkSnakeId) {
        return false;
    }
    // Check that seed is present and is a string
    return typeof seed === "string";
}
exports.isWalletData = isWalletData;
/**
 * Type guard to check if data matches the MnemonicSeedPhrase format.
 *
 * @param data - The data to check
 * @returns True if data matches the MnemonicSeedPhrase format
 */
function isMnemonicSeedPhrase(data) {
    if (typeof data !== "object" || data === null) {
        return false;
    }
    const { mnemonicPhrase } = data;
    return typeof mnemonicPhrase === "string";
}
exports.isMnemonicSeedPhrase = isMnemonicSeedPhrase;
/**
 * ServerSigner status type definition.
 */
var ServerSignerStatus;
(function (ServerSignerStatus) {
    ServerSignerStatus["PENDING"] = "pending_seed_creation";
    ServerSignerStatus["ACTIVE"] = "active_seed";
})(ServerSignerStatus || (exports.ServerSignerStatus = ServerSignerStatus = {}));
/**
 * StakeOptionsMode type definition.
 */
var StakeOptionsMode;
(function (StakeOptionsMode) {
    /**
     * Defaults to the mode specific to the asset.
     */
    StakeOptionsMode["DEFAULT"] = "default";
    /**
     * Partial represents Partial Ethereum Staking mode.
     */
    StakeOptionsMode["PARTIAL"] = "partial";
    /**
     * Native represents Native Ethereum Staking mode.
     */
    StakeOptionsMode["NATIVE"] = "native";
})(StakeOptionsMode || (exports.StakeOptionsMode = StakeOptionsMode = {}));
/**
 * Smart Contract Type
 */
var SmartContractType;
(function (SmartContractType) {
    SmartContractType["ERC20"] = "erc20";
    SmartContractType["ERC721"] = "erc721";
    SmartContractType["ERC1155"] = "erc1155";
    SmartContractType["CUSTOM"] = "custom";
})(SmartContractType || (exports.SmartContractType = SmartContractType = {}));
