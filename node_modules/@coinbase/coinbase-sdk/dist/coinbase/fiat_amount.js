"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiatAmount = void 0;
/**
 * A representation of a FiatAmount that includes the amount and currency.
 */
class FiatAmount {
    /**
     * Initialize a new FiatAmount. Do not use this directly, use the fromModel method instead.
     *
     * @param amount - The amount in the fiat currency
     * @param currency - The currency code (e.g. 'USD')
     */
    constructor(amount, currency) {
        this.amount = amount;
        this.currency = currency;
    }
    /**
     * Convert a FiatAmount model to a FiatAmount.
     *
     * @param fiatAmountModel - The fiat amount from the API.
     * @returns The converted FiatAmount object.
     */
    static fromModel(fiatAmountModel) {
        return new FiatAmount(fiatAmountModel.amount, fiatAmountModel.currency);
    }
    /**
     * Get the amount in the fiat currency.
     *
     * @returns The amount in the fiat currency.
     */
    getAmount() {
        return this.amount;
    }
    /**
     * Get the currency code.
     *
     * @returns The currency code.
     */
    getCurrency() {
        return this.currency;
    }
    /**
     * Get a string representation of the FiatAmount.
     *
     * @returns A string representation of the FiatAmount.
     */
    toString() {
        return `FiatAmount(amount: '${this.amount}', currency: '${this.currency}')`;
    }
}
exports.FiatAmount = FiatAmount;
