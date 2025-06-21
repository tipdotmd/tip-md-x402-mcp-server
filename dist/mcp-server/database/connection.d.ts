import { Db } from 'mongodb';
/**
 * Initialize the MongoDB connection
 * @returns {Promise<Db>} MongoDB database instance
 */
export declare function connectToDatabase(): Promise<Db>;
/**
 * Get the database instance
 * @returns {Promise<Db>} MongoDB database instance
 */
export declare function getDb(): Promise<Db>;
/**
 * Close the MongoDB connection
 */
export declare function closeConnection(): Promise<void>;
/**
 * Set the mockMode for testing
 */
export declare function setMockMode(mode: boolean): void;
/**
 * Check if we're in mock mode
 */
export declare function isMockMode(): boolean;
//# sourceMappingURL=connection.d.ts.map