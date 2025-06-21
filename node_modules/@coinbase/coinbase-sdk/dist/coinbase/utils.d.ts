import { Axios, AxiosResponse, InternalAxiosRequestConfig } from "axios";
/**
 * Prints Axios response to the console for debugging purposes.
 *
 * @param response - The Axios response object.
 * @param debugging - Flag to enable or disable logging.
 * @returns The Axios response object.
 */
export declare const logApiResponse: (response: AxiosResponse, debugging?: boolean) => AxiosResponse;
/**
 * Axios Request interceptor function type.
 *
 * @param value - The Axios request configuration.
 * @returns The modified Axios request configuration.
 */
type RequestFunctionType = (value: InternalAxiosRequestConfig<any>) => Promise<InternalAxiosRequestConfig> | InternalAxiosRequestConfig;
/**
 * Axios Response interceptor function type.
 *
 * @param value - The Axios response object.
 * @returns The modified Axios response object.
 */
type ResponseFunctionType = (value: AxiosResponse<any, any>) => AxiosResponse<any, any>;
/**
 * Registers request and response interceptors to an Axios instance.
 *
 * @param axiosInstance - The Axios instance to register the interceptors.
 * @param requestFn - The request interceptor function.
 * @param responseFn - The response interceptor function.
 */
export declare const registerAxiosInterceptors: (axiosInstance: Axios, requestFn: RequestFunctionType, responseFn: ResponseFunctionType) => void;
/**
 * Converts a Uint8Array to a hex string.
 *
 * @param key - The key to convert.
 * @returns The converted hex string.
 */
export declare const convertStringToHex: (key: Uint8Array) => string;
/**
 * Delays the execution of the function by the specified number of seconds.
 *
 * @param seconds - The number of seconds to delay the execution.
 * @returns A promise that resolves after the specified number of seconds.
 */
export declare function delay(seconds: number): Promise<void>;
/**
 * Parses an Unsigned Payload and returns the JSON object.
 *
 * @throws {InvalidUnsignedPayload} If the Unsigned Payload is invalid.
 * @param payload - The Unsigned Payload.
 * @returns The parsed JSON object.
 */
export declare function parseUnsignedPayload(payload: string): Record<string, any>;
/**
 * Formats the input date to 'YYYY-MM-DD'
 *
 * @param date - The date to format.
 *
 * @returns a formated date of 'YYYY-MM-DD'
 */
export declare function formatDate(date: Date): string;
/**
 *
 * Takes a date and subtracts a week from it. (7 days)
 *
 * @param date - The date to be formatted.
 *
 * @returns a formatted date that is one week ago.
 */
export declare function getWeekBackDate(date: Date): string;
export {};
