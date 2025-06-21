export interface User {
    _id: string | number;
    username: string;
    email: string;
    solanaAddress?: string;
    ethereumAddress?: string;
    bitcoinLightningAddress?: string;
    wallets?: {
        ethereum?: string;
        solana?: string;
        bitcoin?: string;
        [key: string]: string | undefined;
    };
    createdAt: Date;
    updatedAt: Date;
    githubId?: string;
    githubUsername?: string;
    githubAvatar?: string;
    githubBio?: string;
    isAdmin?: boolean;
    id?: number;
    ethereumSplitDeploymentStatus?: string;
    ethereumSplitDeploymentTimestamp?: Date;
    ethereumSplitAddress?: string;
    ethereumSplitTxHash?: string;
}
/**
 * Repository for read-only user data access
 * Provides methods to retrieve user information from MongoDB
 */
export declare class UserRepository {
    private collection;
    private db;
    /**
     * Get the users collection
     * @returns {Promise<Collection<User>>} MongoDB collection
     */
    private getCollection;
    /**
     * Get a user by ID
     * @param id User ID
     * @returns {Promise<User | null>} User object or null if not found
     */
    getUserById(id: string | number): Promise<User | null>;
    /**
     * Get a user by username
     * @param username Username
     * @returns {Promise<User | null>} User object or null if not found
     */
    getUserByUsername(username: string): Promise<User | null>;
}
export declare const userRepository: UserRepository;
//# sourceMappingURL=userRepository.d.ts.map