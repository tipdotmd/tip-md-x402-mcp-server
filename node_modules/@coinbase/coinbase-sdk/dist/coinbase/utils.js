"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeekBackDate = exports.formatDate = exports.parseUnsignedPayload = exports.delay = exports.convertStringToHex = exports.registerAxiosInterceptors = exports.logApiResponse = void 0;
const api_error_1 = require("./api_error");
const errors_1 = require("./errors");
/**
 * Prints Axios response to the console for debugging purposes.
 *
 * @param response - The Axios response object.
 * @param debugging - Flag to enable or disable logging.
 * @returns The Axios response object.
 */
const logApiResponse = (response, debugging = false) => {
    if (debugging) {
        let output = typeof response.data === "string" ? response.data : "";
        if (typeof response.data === "object") {
            output = JSON.stringify(response.data, null, 4);
        }
        console.log(`API RESPONSE: 
      Status: ${response.status} 
      URL: ${response.config.url} 
      Data: ${output}`);
    }
    return response;
};
exports.logApiResponse = logApiResponse;
/**
 * Registers request and response interceptors to an Axios instance.
 *
 * @param axiosInstance - The Axios instance to register the interceptors.
 * @param requestFn - The request interceptor function.
 * @param responseFn - The response interceptor function.
 */
const registerAxiosInterceptors = (axiosInstance, requestFn, responseFn) => {
    axiosInstance.interceptors.request.use(requestFn);
    axiosInstance.interceptors.response.use(responseFn, error => {
        return Promise.reject(api_error_1.APIError.fromError(error));
    });
};
exports.registerAxiosInterceptors = registerAxiosInterceptors;
/**
 * Converts a Uint8Array to a hex string.
 *
 * @param key - The key to convert.
 * @returns The converted hex string.
 */
const convertStringToHex = (key) => {
    return Buffer.from(key).toString("hex");
};
exports.convertStringToHex = convertStringToHex;
/**
 * Delays the execution of the function by the specified number of seconds.
 *
 * @param seconds - The number of seconds to delay the execution.
 * @returns A promise that resolves after the specified number of seconds.
 */
async function delay(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
exports.delay = delay;
/**
 * Parses an Unsigned Payload and returns the JSON object.
 *
 * @throws {InvalidUnsignedPayload} If the Unsigned Payload is invalid.
 * @param payload - The Unsigned Payload.
 * @returns The parsed JSON object.
 */
function parseUnsignedPayload(payload) {
    const rawPayload = payload.match(/../g)?.map(byte => parseInt(byte, 16));
    if (!rawPayload) {
        throw new errors_1.InvalidUnsignedPayloadError("Unable to parse unsigned payload");
    }
    let parsedPayload;
    try {
        const rawPayloadBytes = new Uint8Array(rawPayload);
        const decoder = new TextDecoder();
        parsedPayload = JSON.parse(decoder.decode(rawPayloadBytes));
    }
    catch (error) {
        throw new errors_1.InvalidUnsignedPayloadError("Unable to decode unsigned payload JSON");
    }
    return parsedPayload;
}
exports.parseUnsignedPayload = parseUnsignedPayload;
/**
 * Formats the input date to 'YYYY-MM-DD'
 *
 * @param date - The date to format.
 *
 * @returns a formated date of 'YYYY-MM-DD'
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T00:00:00Z`;
}
exports.formatDate = formatDate;
/**
 *
 * Takes a date and subtracts a week from it. (7 days)
 *
 * @param date - The date to be formatted.
 *
 * @returns a formatted date that is one week ago.
 */
function getWeekBackDate(date) {
    date.setDate(date.getDate() - 7);
    return formatDate(date);
}
exports.getWeekBackDate = getWeekBackDate;
