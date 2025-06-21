import { getDb } from './connection.js';
import { logger } from '../src/index.js'; // This path is correct now
import NodeCache from 'node-cache';
// In-memory cache for frequently accessed users
// TTL set to 5 minutes (300 seconds)
const userCache = new NodeCache({
    stdTTL: 300,
    checkperiod: 60,
    useClones: false
});
/**
 * Repository for read-only user data access
 * Provides methods to retrieve user information from MongoDB
 */
export class UserRepository {
    collection = null;
    db = null;
    /**
     * Get the users collection
     * @returns {Promise<Collection<User>>} MongoDB collection
     */
    async getCollection() {
        if (this.collection) {
            return this.collection;
        }
        this.db = await getDb();
        if (!this.db) {
            throw new Error('Failed to get database instance.');
        }
        this.collection = this.db.collection('users');
        return this.collection;
    }
    /**
     * Get a user by ID
     * @param id User ID
     * @returns {Promise<User | null>} User object or null if not found
     */
    async getUserById(id) {
        const cacheKey = `user_${id}`;
        // Try to get from cache first
        const cachedUser = userCache.get(cacheKey);
        if (cachedUser) {
            return cachedUser;
        }
        try {
            const collection = await this.getCollection();
            // Handle both string and number IDs
            const query = typeof id === 'number'
                ? { $or: [{ _id: id }, { id: id }] }
                : { _id: id };
            const user = await collection.findOne(query);
            if (user) {
                // Store in cache for future requests
                userCache.set(cacheKey, user);
            }
            return user;
        }
        catch (error) {
            logger.error(`Error getting user by ID: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
    /**
     * Get a user by username
     * @param username Username
     * @returns {Promise<User | null>} User object or null if not found
     */
    async getUserByUsername(username) {
        const cacheKey = `user_username_${username}`;
        // Try to get from cache first
        const cachedUser = userCache.get(cacheKey);
        if (cachedUser) {
            return cachedUser;
        }
        try {
            const collection = await this.getCollection();
            const user = await collection.findOne({ username });
            if (user) {
                // Store in cache for future requests
                userCache.set(cacheKey, user);
                // Also cache by ID for future ID-based lookups
                userCache.set(`user_${user._id}`, user);
            }
            return user;
        }
        catch (error) {
            logger.error(`Error getting user by username: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
}
// Singleton instance
export const userRepository = new UserRepository();
