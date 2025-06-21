import Decimal from "decimal.js";
import { Asset as AssetModel } from "./../client/api";
/** A representation of an Asset. */
export declare class Asset {
    readonly networkId: string;
    readonly assetId: string;
    readonly contractAddress: string;
    readonly decimals: number;
    /**
     * Private constructor for the Asset class.
     *
     * @param networkId - The network ID.
     * @param assetId - The asset ID.
     * @param contractAddress - The address ID.
     * @param decimals - The number of decimals.
     */
    private constructor();
    /**
     * Creates an Asset from an Asset Model.
     *
     * @param model - The Asset Model.
     * @param assetId - The Asset ID.
     * @throws If the Asset Model is invalid.
     * @returns The Asset Class.
     */
    static fromModel(model: AssetModel, assetId?: string): Asset;
    /**
     * Fetches the Asset with the provided Asset ID.
     *
     * @param networkId - The network ID.
     * @param assetId - The asset ID.
     * @throws If the Asset cannot be fetched.
     * @returns The Asset Class.
     */
    static fetch(networkId: string, assetId: string): Promise<Asset>;
    /**
     * Returns the primary denomination for the provided Asset ID.
     * For `gwei` and `wei` the primary denomination is `eth`.
     * For all other assets, the primary denomination is the same asset ID.
     *
     * @param assetId - The Asset ID.
     * @returns The primary denomination for the Asset ID.
     */
    static primaryDenomination(assetId: string): string;
    /**
     * Returns the primary denomination for the Asset.
     *
     * @returns The primary denomination for the Asset.
     */
    primaryDenomination(): string;
    /**
     * Converts the amount of the Asset from whole to atomic units.
     *
     * @param wholeAmount - The whole amount to convert to atomic units.
     * @returns The amount in atomic units
     */
    toAtomicAmount(wholeAmount: Decimal): bigint;
    /**
     * Converts the amount of the Asset from atomic to whole units.
     *
     * @param atomicAmount - The atomic amount to convert to whole units.
     * @returns The amount in atomic units
     */
    fromAtomicAmount(atomicAmount: Decimal): Decimal;
    /**
     * Returns a string representation of the Asset.
     *
     * @returns a string representation of the Asset
     */
    toString(): string;
    /**
     * Returns the Asset ID.
     *
     * @returns The Asset ID.
     */
    getAssetId(): string;
}
