import { getDb } from './connection.js';
// import { logger } from '../src/index.js'; // REMOVED import
import NodeCache from 'node-cache';
// Added local logger
const repoLogger = {
    info: (...args) => console.log('[User Repo]', ...args),
    error: (...args) => console.error('[User Repo ERROR]', ...args),
    warn: (...args) => console.warn('[User Repo WARN]', ...args),
};
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
        this.db = await getDb(); // Assuming getDb is exported from connection.ts
        if (!this.db) {
            throw new Error('Failed to get database instance.');
        }
        this.collection = this.db.collection('users'); // Assuming 'users' is the collection name
        return this.collection;
    }
    /**
     * Get a user by ID
     * @param id User ID
     * @returns {Promise<User | null>} User object or null if not found
     */
    async getUserById(id) {
        const cacheKey = `user_${id}`;
        const cachedUser = userCache.get(cacheKey);
        if (cachedUser) {
            return cachedUser;
        }
        try {
            const collection = await this.getCollection();
            const query = typeof id === 'number'
                ? { $or: [{ _id: id }, { id: id }] } // Handle potential numeric _id or separate id field
                : { _id: id }; // Assuming _id is string if not number
            const user = await collection.findOne(query);
            if (user) {
                userCache.set(cacheKey, user);
            }
            return user;
        }
        catch (error) {
            repoLogger.error(`Error getting user by ID ${id}: ${error instanceof Error ? error.message : String(error)}`);
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
        const cachedUser = userCache.get(cacheKey);
        if (cachedUser) {
            return cachedUser;
        }
        try {
            const collection = await this.getCollection();
            // Perform case-insensitive search for username for better UX
            const user = await collection.findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
            if (user) {
                userCache.set(cacheKey, user);
                userCache.set(`user_${user._id}`, user); // Cache by ID too
            }
            return user;
        }
        catch (error) {
            repoLogger.error(`Error getting user by username ${username}: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
}
// Singleton instance
export const userRepository = new UserRepository();
