import Decimal from "decimal.js";
import { CryptoAmount as CryptoAmountModel } from "../client/api";
import { Asset } from "./asset";
/**
 * A representation of a CryptoAmount that includes the amount and asset.
 */
export declare class CryptoAmount {
    private amount;
    private assetObj;
    private assetId;
    /**
     * Creates a new CryptoAmount instance.
     *
     * @param amount - The amount of the Asset
     * @param asset - The Asset
     * @param assetId - Optional Asset ID override
     */
    constructor(amount: Decimal, asset: Asset, assetId?: string);
    /**
     * Converts a CryptoAmount model to a CryptoAmount.
     *
     * @param amountModel - The crypto amount from the API
     * @returns The converted CryptoAmount object
     */
    static fromModel(amountModel: CryptoAmountModel): CryptoAmount;
    /**
     * Converts a CryptoAmount model and asset ID to a CryptoAmount.
     * This can be used to specify a non-primary denomination that we want the amount
     * to be converted to.
     *
     * @param amountModel - The crypto amount from the API
     * @param assetId - The Asset ID of the denomination we want returned
     * @returns The converted CryptoAmount object
     */
    static fromModelAndAssetId(amountModel: CryptoAmountModel, assetId: string): CryptoAmount;
    /**
     * Gets the amount of the Asset.
     *
     * @returns The amount of the Asset
     */
    getAmount(): Decimal;
    /**
     * Gets the Asset.
     *
     * @returns The Asset
     */
    getAsset(): Asset;
    /**
     * Gets the Asset ID.
     *
     * @returns The Asset ID
     */
    getAssetId(): string;
    /**
     * Converts the amount to atomic units.
     *
     * @returns The amount in atomic units
     */
    toAtomicAmount(): bigint;
    /**
     * Returns a string representation of the CryptoAmount.
     *
     * @returns A string representation of the CryptoAmount
     */
    toString(): string;
}
