import { AxiosError } from "axios";
/**
 * A wrapper for API errors to provide more context.
 */
export declare class APIError extends AxiosError {
    httpCode: number | null;
    apiCode: string | null;
    apiMessage: string | null;
    correlationId: string | null;
    /**
     * Initializes a new APIError object.
     *
     * @class
     * @param {AxiosError} error - The Axios error.
     */
    constructor(error: any);
    /**
     * Creates a specific APIError based on the API error code.
     *
     * @param {AxiosError} error - The underlying error object.
     * @returns {APIError} A specific APIError instance.
     */
    static fromError(error: AxiosError): APIError;
    /**
     * Returns a String representation of the APIError.
     *
     * @returns {string} a String representation of the APIError
     */
    toString(): string;
}
export declare class InternalError extends APIError {
}
export declare class UnimplementedError extends APIError {
}
export declare class UnauthorizedError extends APIError {
}
export declare class NotFoundError extends APIError {
}
export declare class InvalidWalletIDError extends APIError {
}
export declare class InvalidAddressIDError extends APIError {
}
export declare class InvalidWalletError extends APIError {
}
export declare class InvalidAddressError extends APIError {
}
export declare class InvalidAmountError extends APIError {
}
export declare class InvalidTransferIDError extends APIError {
}
export declare class InvalidPageError extends APIError {
}
export declare class InvalidLimitError extends APIError {
}
export declare class AlreadyExistsError extends APIError {
}
export declare class MalformedRequestError extends APIError {
}
export declare class UnsupportedAssetError extends APIError {
}
export declare class InvalidAssetIDError extends APIError {
}
export declare class InvalidDestinationError extends APIError {
}
export declare class InvalidNetworkIDError extends APIError {
}
export declare class ResourceExhaustedError extends APIError {
}
export declare class FaucetLimitReachedError extends APIError {
}
export declare class InvalidSignedPayloadError extends APIError {
}
export declare class InvalidTransferStatusError extends APIError {
}
export declare class NetworkFeatureUnsupportedError extends APIError {
}
