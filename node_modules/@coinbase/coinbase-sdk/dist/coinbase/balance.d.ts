import Decimal from "decimal.js";
import { Balance as BalanceModel } from "../client";
import { Asset } from "./asset";
/** A representation of a balance. */
export declare class Balance {
    readonly amount: Decimal;
    readonly assetId: string;
    readonly asset?: Asset;
    /**
     * Private constructor to prevent direct instantiation outside of the factory methods.
     *
     * @ignore
     * @param {Decimal} amount - The amount of the balance.
     * @param {string} assetId - The asset ID.
     * @hideconstructor
     */
    private constructor();
    /**
     * Converts a BalanceModel into a Balance object.
     *
     * @param {BalanceModel} model - The balance model object.
     * @returns {Balance} The Balance object.
     */
    static fromModel(model: BalanceModel): Balance;
    /**
     * Converts a BalanceModel and asset ID into a Balance object.
     *
     * @param {BalanceModel} model - The balance model object.
     * @param {string} assetId - The asset ID.
     * @returns {Balance} The Balance object.
     */
    static fromModelAndAssetId(model: BalanceModel, assetId: string): Balance;
}
