import { FiatAmount as FiatAmountModel } from "../client/api";
/**
 * A representation of a FiatAmount that includes the amount and currency.
 */
export declare class FiatAmount {
    private amount;
    private currency;
    /**
     * Initialize a new FiatAmount. Do not use this directly, use the fromModel method instead.
     *
     * @param amount - The amount in the fiat currency
     * @param currency - The currency code (e.g. 'USD')
     */
    constructor(amount: string, currency: string);
    /**
     * Convert a FiatAmount model to a FiatAmount.
     *
     * @param fiatAmountModel - The fiat amount from the API.
     * @returns The converted FiatAmount object.
     */
    static fromModel(fiatAmountModel: FiatAmountModel): FiatAmount;
    /**
     * Get the amount in the fiat currency.
     *
     * @returns The amount in the fiat currency.
     */
    getAmount(): string;
    /**
     * Get the currency code.
     *
     * @returns The currency code.
     */
    getCurrency(): string;
    /**
     * Get a string representation of the FiatAmount.
     *
     * @returns A string representation of the FiatAmount.
     */
    toString(): string;
}
