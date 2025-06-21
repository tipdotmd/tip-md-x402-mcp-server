import { MongoClient } from "mongodb";
export declare function connectToDatabase(): Promise<{
    db: any;
    isInMemoryMode: boolean;
    client?: undefined;
} | {
    db: any;
    client: MongoClient;
    isInMemoryMode?: undefined;
}>;
export declare function getDb(): any;
export declare function isUsingInMemoryMode(): boolean;
export declare function initializeTrendingCollections(): Promise<{
    success: boolean;
    message: string;
    details?: undefined;
} | {
    success: boolean;
    message: string;
    details: string[];
}>;
export declare function closeConnection(): Promise<void>;
//# sourceMappingURL=db.d.ts.map