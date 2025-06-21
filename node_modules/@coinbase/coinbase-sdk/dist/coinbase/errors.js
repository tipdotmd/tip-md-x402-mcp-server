"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UninitializedSDKError = exports.AlreadySignedError = exports.NotSignedError = exports.InvalidUnsignedPayloadError = exports.InvalidConfigurationError = exports.ArgumentError = exports.TimeoutError = exports.InvalidAPIKeyFormatError = void 0;
/**
 * InvalidAPIKeyFormatError error is thrown when the API key format is invalid.
 */
class InvalidAPIKeyFormatError extends Error {
    /**
     * Initializes a new InvalidAPIKeyFormat instance.
     *
     * @param message - The error message.
     */
    constructor(message = InvalidAPIKeyFormatError.DEFAULT_MESSAGE) {
        super(message);
        this.name = "InvalidAPIKeyFormatError";
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InvalidAPIKeyFormatError);
        }
    }
}
exports.InvalidAPIKeyFormatError = InvalidAPIKeyFormatError;
InvalidAPIKeyFormatError.DEFAULT_MESSAGE = "Invalid API key format";
/**
 * TimeoutError is thrown when an operation times out.
 */
class TimeoutError extends Error {
    /**
     * Initializes a new TimeoutError instance.
     *
     * @param message - The error message.
     */
    constructor(message = "Timeout Error") {
        super(message);
        this.name = "TimeoutError";
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, TimeoutError);
        }
    }
}
exports.TimeoutError = TimeoutError;
/**
 * ArgumentError is thrown when an argument is invalid.
 */
class ArgumentError extends Error {
    /**
     * Initializes a new ArgumentError instance.
     *
     * @param message - The error message.
     */
    constructor(message = ArgumentError.DEFAULT_MESSAGE) {
        super(message);
        this.name = "ArgumentError";
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ArgumentError);
        }
    }
}
exports.ArgumentError = ArgumentError;
ArgumentError.DEFAULT_MESSAGE = "Argument Error";
/**
 * InvalidConfigurationError error is thrown when apikey/privateKey configuration is invalid.
 */
class InvalidConfigurationError extends Error {
    /**
     * Initializes a new InvalidConfiguration instance.
     *
     * @param message - The error message.
     */
    constructor(message = InvalidConfigurationError.DEFAULT_MESSAGE) {
        super(message);
        this.name = "InvalidConfigurationError";
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InvalidConfigurationError);
        }
    }
}
exports.InvalidConfigurationError = InvalidConfigurationError;
InvalidConfigurationError.DEFAULT_MESSAGE = "Invalid configuration";
/**
 * InvalidUnsignedPayload error is thrown when the unsigned payload is invalid.
 */
class InvalidUnsignedPayloadError extends Error {
    /**
     * Initializes a new InvalidUnsignedPayload instance.
     *
     * @param message - The error message.
     */
    constructor(message = InvalidUnsignedPayloadError.DEFAULT_MESSAGE) {
        super(message);
        this.name = "InvalidUnsignedPayloadError";
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, InvalidUnsignedPayloadError);
        }
    }
}
exports.InvalidUnsignedPayloadError = InvalidUnsignedPayloadError;
InvalidUnsignedPayloadError.DEFAULT_MESSAGE = "Invalid unsigned payload";
/**
 * NotSignedError is thrown when a resource is not signed.
 */
class NotSignedError extends Error {
    /**
     * Initializes a new NotSignedError instance.
     *
     * @param message - The error message.
     */
    constructor(message = "Resource not signed") {
        super(message);
        this.name = "NotSignedError";
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NotSignedError);
        }
    }
}
exports.NotSignedError = NotSignedError;
/**
 * AlreadySignedError is thrown when a resource is already signed.
 */
class AlreadySignedError extends Error {
    /**
     * Initializes a new AlreadySignedError instance.
     *
     * @param message - The error message.
     */
    constructor(message = AlreadySignedError.DEFAULT_MESSAGE) {
        super(message);
        this.name = "AlreadySignedError";
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AlreadySignedError);
        }
    }
}
exports.AlreadySignedError = AlreadySignedError;
AlreadySignedError.DEFAULT_MESSAGE = "Resource already signed";
/**
 * UninitializedSDKError is thrown when the Coinbase instance is not initialized.
 */
class UninitializedSDKError extends Error {
    /**
     * Initializes a new UninitializedSDKError instance.
     *
     * @param message - The error message.
     */
    constructor(message = UninitializedSDKError.DEFAULT_MESSAGE) {
        super(message);
        this.name = "UninitializedSDKError";
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UninitializedSDKError);
        }
    }
}
exports.UninitializedSDKError = UninitializedSDKError;
UninitializedSDKError.DEFAULT_MESSAGE = "Coinbase SDK has not been initialized. Please initialize by calling either:\n\n" +
    "- Coinbase.configure({apiKeyName: '...', privateKey: '...'})\n" +
    "- Coinbase.configureFromJson({filePath: '/path/to/api_keys.json'})\n\n" +
    "If needed, register for API keys at https://portal.cdp.coinbase.com/ or view the docs at https://docs.cdp.coinbase.com/wallet-api/docs/welcome";
