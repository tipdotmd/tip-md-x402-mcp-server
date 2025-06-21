"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceMap = void 0;
const balance_1 = require("./balance");
/**
 * A convenience class for storing and manipulating Asset balances in a human-readable format.
 */
class BalanceMap extends Map {
    /**
     * Converts a list of Balance models to a BalanceMap.
     *
     * @param {BalanceModel[]} balances - The list of balances fetched from the API.
     * @returns {BalanceMap} The converted BalanceMap object.
     */
    static fromBalances(balances) {
        const balanceMap = new BalanceMap();
        balances.forEach(balanceModel => {
            const balance = balance_1.Balance.fromModel(balanceModel);
            balanceMap.add(balance);
        });
        return balanceMap;
    }
    /**
     * Adds a balance to the map.
     *
     * @param {Balance} balance - The balance to add to the map.
     */
    add(balance) {
        if (!(balance instanceof balance_1.Balance)) {
            throw new Error("balance must be a Balance");
        }
        this.set(balance.assetId, balance.amount);
    }
    /**
     * Returns a string representation of the balance map.
     *
     * @returns The string representation of the balance map.
     */
    toString() {
        const result = {};
        this.forEach((value, key) => {
            let str = value.toString();
            if (value.isInteger()) {
                str = value.toNumber().toString();
            }
            result[key] = str;
        });
        return `BalanceMap${JSON.stringify(result)}`;
    }
}
exports.BalanceMap = BalanceMap;
