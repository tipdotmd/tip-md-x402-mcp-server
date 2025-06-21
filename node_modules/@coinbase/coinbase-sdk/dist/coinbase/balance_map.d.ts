import { Balance } from "./balance";
import { Balance as BalanceModel } from "../client";
import { Decimal } from "decimal.js";
/**
 * A convenience class for storing and manipulating Asset balances in a human-readable format.
 */
export declare class BalanceMap extends Map<string, Decimal> {
    /**
     * Converts a list of Balance models to a BalanceMap.
     *
     * @param {BalanceModel[]} balances - The list of balances fetched from the API.
     * @returns {BalanceMap} The converted BalanceMap object.
     */
    static fromBalances(balances: BalanceModel[]): BalanceMap;
    /**
     * Adds a balance to the map.
     *
     * @param {Balance} balance - The balance to add to the map.
     */
    add(balance: Balance): void;
    /**
     * Returns a string representation of the balance map.
     *
     * @returns The string representation of the balance map.
     */
    toString(): string;
}
