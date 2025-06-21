"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkFeatureUnsupportedError = exports.InvalidTransferStatusError = exports.InvalidSignedPayloadError = exports.FaucetLimitReachedError = exports.ResourceExhaustedError = exports.InvalidNetworkIDError = exports.InvalidDestinationError = exports.InvalidAssetIDError = exports.UnsupportedAssetError = exports.MalformedRequestError = exports.AlreadyExistsError = exports.InvalidLimitError = exports.InvalidPageError = exports.InvalidTransferIDError = exports.InvalidAmountError = exports.InvalidAddressError = exports.InvalidWalletError = exports.InvalidAddressIDError = exports.InvalidWalletIDError = exports.NotFoundError = exports.UnauthorizedError = exports.UnimplementedError = exports.InternalError = exports.APIError = void 0;
/* eslint-disable jsdoc/require-jsdoc */
const axios_1 = require("axios");
/**
 * A wrapper for API errors to provide more context.
 */
class APIError extends axios_1.AxiosError {
    /**
     * Initializes a new APIError object.
     *
     * @class
     * @param {AxiosError} error - The Axios error.
     */
    constructor(error) {
        super();
        this.name = this.constructor.name;
        this.httpCode = error.response ? error.response.status : null;
        this.apiCode = null;
        this.apiMessage = null;
        this.correlationId = null;
        if (error.response && error.response.data) {
            const body = error.response.data;
            this.apiCode = body.code;
            this.apiMessage = body.message;
            this.correlationId = body.correlation_id;
        }
    }
    /**
     * Creates a specific APIError based on the API error code.
     *
     * @param {AxiosError} error - The underlying error object.
     * @returns {APIError} A specific APIError instance.
     */
    static fromError(error) {
        const apiError = new APIError(error);
        if (!error.response || !error.response.data) {
            return apiError;
        }
        const body = error?.response?.data;
        switch (body?.code) {
            case "unimplemented":
                return new UnimplementedError(error);
            case "unauthorized":
                return new UnauthorizedError(error);
            case "internal":
                return new InternalError(error);
            case "not_found":
                return new NotFoundError(error);
            case "invalid_wallet_id":
                return new InvalidWalletIDError(error);
            case "invalid_address_id":
                return new InvalidAddressIDError(error);
            case "invalid_wallet":
                return new InvalidWalletError(error);
            case "invalid_address":
                return new InvalidAddressError(error);
            case "invalid_amount":
                return new InvalidAmountError(error);
            case "invalid_transfer_id":
                return new InvalidTransferIDError(error);
            case "invalid_page_token":
                return new InvalidPageError(error);
            case "invalid_page_limit":
                return new InvalidLimitError(error);
            case "already_exists":
                return new AlreadyExistsError(error);
            case "malformed_request":
                return new MalformedRequestError(error);
            case "unsupported_asset":
                return new UnsupportedAssetError(error);
            case "invalid_asset_id":
                return new InvalidAssetIDError(error);
            case "invalid_destination":
                return new InvalidDestinationError(error);
            case "invalid_network_id":
                return new InvalidNetworkIDError(error);
            case "resource_exhausted":
                return new ResourceExhaustedError(error);
            case "faucet_limit_reached":
                return new FaucetLimitReachedError(error);
            case "invalid_signed_payload":
                return new InvalidSignedPayloadError(error);
            case "invalid_transfer_status":
                return new InvalidTransferStatusError(error);
            case "network_feature_unsupported":
                return new NetworkFeatureUnsupportedError(error);
            default:
                return apiError;
        }
    }
    /**
     * Returns a String representation of the APIError.
     *
     * @returns {string} a String representation of the APIError
     */
    toString() {
        const payload = {};
        if (this.httpCode)
            payload.httpCode = this.httpCode;
        if (this.apiCode)
            payload.apiCode = this.apiCode;
        if (this.apiMessage)
            payload.apiMessage = this.apiMessage;
        if (this.correlationId)
            payload.correlationId = this.correlationId;
        return `${this.name}{${Object.entries(payload)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ")}}`;
    }
}
exports.APIError = APIError;
class InternalError extends APIError {
}
exports.InternalError = InternalError;
class UnimplementedError extends APIError {
}
exports.UnimplementedError = UnimplementedError;
class UnauthorizedError extends APIError {
}
exports.UnauthorizedError = UnauthorizedError;
class NotFoundError extends APIError {
}
exports.NotFoundError = NotFoundError;
class InvalidWalletIDError extends APIError {
}
exports.InvalidWalletIDError = InvalidWalletIDError;
class InvalidAddressIDError extends APIError {
}
exports.InvalidAddressIDError = InvalidAddressIDError;
class InvalidWalletError extends APIError {
}
exports.InvalidWalletError = InvalidWalletError;
class InvalidAddressError extends APIError {
}
exports.InvalidAddressError = InvalidAddressError;
class InvalidAmountError extends APIError {
}
exports.InvalidAmountError = InvalidAmountError;
class InvalidTransferIDError extends APIError {
}
exports.InvalidTransferIDError = InvalidTransferIDError;
class InvalidPageError extends APIError {
}
exports.InvalidPageError = InvalidPageError;
class InvalidLimitError extends APIError {
}
exports.InvalidLimitError = InvalidLimitError;
class AlreadyExistsError extends APIError {
}
exports.AlreadyExistsError = AlreadyExistsError;
class MalformedRequestError extends APIError {
}
exports.MalformedRequestError = MalformedRequestError;
class UnsupportedAssetError extends APIError {
}
exports.UnsupportedAssetError = UnsupportedAssetError;
class InvalidAssetIDError extends APIError {
}
exports.InvalidAssetIDError = InvalidAssetIDError;
class InvalidDestinationError extends APIError {
}
exports.InvalidDestinationError = InvalidDestinationError;
class InvalidNetworkIDError extends APIError {
}
exports.InvalidNetworkIDError = InvalidNetworkIDError;
class ResourceExhaustedError extends APIError {
}
exports.ResourceExhaustedError = ResourceExhaustedError;
class FaucetLimitReachedError extends APIError {
}
exports.FaucetLimitReachedError = FaucetLimitReachedError;
class InvalidSignedPayloadError extends APIError {
}
exports.InvalidSignedPayloadError = InvalidSignedPayloadError;
class InvalidTransferStatusError extends APIError {
}
exports.InvalidTransferStatusError = InvalidTransferStatusError;
class NetworkFeatureUnsupportedError extends APIError {
}
exports.NetworkFeatureUnsupportedError = NetworkFeatureUnsupportedError;
