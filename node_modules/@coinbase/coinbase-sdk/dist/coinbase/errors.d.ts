/**
 * InvalidAPIKeyFormatError error is thrown when the API key format is invalid.
 */
export declare class InvalidAPIKeyFormatError extends Error {
    static DEFAULT_MESSAGE: string;
    /**
     * Initializes a new InvalidAPIKeyFormat instance.
     *
     * @param message - The error message.
     */
    constructor(message?: string);
}
/**
 * TimeoutError is thrown when an operation times out.
 */
export declare class TimeoutError extends Error {
    /**
     * Initializes a new TimeoutError instance.
     *
     * @param message - The error message.
     */
    constructor(message?: string);
}
/**
 * ArgumentError is thrown when an argument is invalid.
 */
export declare class ArgumentError extends Error {
    static DEFAULT_MESSAGE: string;
    /**
     * Initializes a new ArgumentError instance.
     *
     * @param message - The error message.
     */
    constructor(message?: string);
}
/**
 * InvalidConfigurationError error is thrown when apikey/privateKey configuration is invalid.
 */
export declare class InvalidConfigurationError extends Error {
    static DEFAULT_MESSAGE: string;
    /**
     * Initializes a new InvalidConfiguration instance.
     *
     * @param message - The error message.
     */
    constructor(message?: string);
}
/**
 * InvalidUnsignedPayload error is thrown when the unsigned payload is invalid.
 */
export declare class InvalidUnsignedPayloadError extends Error {
    static DEFAULT_MESSAGE: string;
    /**
     * Initializes a new InvalidUnsignedPayload instance.
     *
     * @param message - The error message.
     */
    constructor(message?: string);
}
/**
 * NotSignedError is thrown when a resource is not signed.
 */
export declare class NotSignedError extends Error {
    /**
     * Initializes a new NotSignedError instance.
     *
     * @param message - The error message.
     */
    constructor(message?: string);
}
/**
 * AlreadySignedError is thrown when a resource is already signed.
 */
export declare class AlreadySignedError extends Error {
    static DEFAULT_MESSAGE: string;
    /**
     * Initializes a new AlreadySignedError instance.
     *
     * @param message - The error message.
     */
    constructor(message?: string);
}
/**
 * UninitializedSDKError is thrown when the Coinbase instance is not initialized.
 */
export declare class UninitializedSDKError extends Error {
    static DEFAULT_MESSAGE: string;
    /**
     * Initializes a new UninitializedSDKError instance.
     *
     * @param message - The error message.
     */
    constructor(message?: string);
}
