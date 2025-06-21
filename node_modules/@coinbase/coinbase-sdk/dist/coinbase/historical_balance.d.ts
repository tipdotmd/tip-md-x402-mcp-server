import Decimal from "decimal.js";
import { HistoricalBalance as HistoricalBalanceModel } from "../client";
import { Asset } from "./asset";
/** A representation of historical balance. */
export declare class HistoricalBalance {
    readonly amount: Decimal;
    readonly blockHash: string;
    readonly blockHeight: Decimal;
    readonly asset: Asset;
    /**
     * Private constructor to prevent direct instantiation outside of the factory methods.
     *
     * @ignore
     * @param {Decimal} amount - The amount of the balance.
     * @param {Decimal} blockHeight - The block height at which the balance was recorded.
     * @param {string} blockHash - The block hash at which the balance was recorded
     * @param {string} asset - The asset we want to fetch.
     * @hideconstructor
     */
    private constructor();
    /**
     * Converts a HistoricalBalanceModel into a HistoricalBalance object.
     *
     * @param {HistoricalBalanceModel} model - The historical balance model object.
     * @returns {HistoricalBalance} The HistoricalBalance object.
     */
    static fromModel(model: HistoricalBalanceModel): HistoricalBalance;
}
