import { type User, type InsertUser, type Tip, type InsertTip } from "../shared/schema.js";
import session from "express-session";
interface NotificationService {
    notifyUserCreated(username: string, source: string): Promise<void>;
    notifyNotificationSent(targetFids: number[], title: string): Promise<void>;
    notifyTipCreated(amount: string, blockchain: string, usdValue?: string, platformFee?: string, recipientUsername?: string, senderName?: string): Promise<void>;
}
declare class NtfyNotificationService implements NotificationService {
    private baseUrl?;
    private authToken?;
    private newUsersTopicUrl?;
    private newTipsTopicUrl?;
    private notifsTopicUrl?;
    constructor();
    private sendNotification;
    notifyUserCreated(username: string, source: string): Promise<void>;
    notifyNotificationSent(targetFids: number[], title: string): Promise<void>;
    notifyTipCreated(amount: string, blockchain: string, usdValue?: string, platformFee?: string, recipientUsername?: string, senderName?: string): Promise<void>;
}
declare const notificationService: NtfyNotificationService;
export interface IStorage {
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    getUserByGithubId(githubId: string): Promise<User | undefined>;
    getUserByGithubUsername(githubUsername: string): Promise<User | undefined>;
    getUserByEmail(email: string): Promise<User | undefined>;
    getUserByFid(fid: number): Promise<User | undefined>;
    getUserByEthereumAddress(address: string): Promise<User | undefined>;
    getUserBySolanaAddress(address: string): Promise<User | undefined>;
    createUser(user: InsertUser): Promise<User>;
    updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
    deleteUser(id: number): Promise<boolean>;
    getTipsByUserId(userId: number): Promise<Tip[]>;
    createTip(tip: InsertTip): Promise<Tip>;
    getTipById(id: number): Promise<Tip | undefined>;
    updateTip(id: number, data: Partial<Tip>): Promise<Tip | undefined>;
    updateUserBitcoinStats(userId: number, amount: number): Promise<User | undefined>;
    linkFarcasterAccount(id: number, fid: number, username: string, avatar?: string): Promise<User | undefined>;
    getOrCreateFarcasterUser(fid: number, username: string, displayName: string, avatar?: string, score?: number): Promise<User>;
    getWalletSessionMapping(sessionId: string): Promise<{
        userId: string;
        createdAt: Date;
        lastUsed: Date;
    } | undefined>;
    createWalletSessionMapping(sessionId: string, userId: string): Promise<void>;
    updateWalletSessionLastUsed(sessionId: string): Promise<void>;
    cleanupExpiredWalletSessions(): Promise<number>;
    getAllUsers(): Promise<User[]>;
    getAllTips(): Promise<Tip[]>;
    getTipStats(): Promise<{
        totalTips: number;
        totalAmount: {
            [key: string]: number;
        };
        totalFees: {
            [key: string]: number;
        };
        tipsByBlockchain: {
            [key: string]: number;
        };
    }>;
    getTipsByDate(startDate?: Date, endDate?: Date): Promise<{
        date: string;
        count: number;
    }[]>;
    createDevStatsShare(users: any[]): Promise<string>;
    getDevStatsShare(id: string): Promise<any[] | null>;
    cleanupExpiredDevStatsShares(): Promise<number>;
    sessionStore: session.Store;
    getNotificationService(): NotificationService;
}
export declare class DatabaseStorage implements IStorage {
    sessionStore: session.Store;
    constructor();
    getUser(id: number): Promise<User | undefined>;
    getUserByUsername(username: string): Promise<User | undefined>;
    getUserByGithubId(githubId: string): Promise<User | undefined>;
    getUserByGithubUsername(githubUsername: string): Promise<User | undefined>;
    getUserByEmail(email: string): Promise<User | undefined>;
    getUserByFid(fid: number): Promise<User | undefined>;
    getUserByEthereumAddress(address: string): Promise<User | undefined>;
    getUserBySolanaAddress(address: string): Promise<User | undefined>;
    createUser(insertUser: InsertUser): Promise<User>;
    updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
    deleteUser(id: number): Promise<boolean>;
    getTipsByUserId(userId: number): Promise<Tip[]>;
    createTip(insertTip: InsertTip): Promise<Tip>;
    getTipById(id: number): Promise<Tip | undefined>;
    updateTip(id: number, data: Partial<Tip>): Promise<Tip | undefined>;
    updateUserBitcoinStats(userId: number, amount: number): Promise<User | undefined>;
    linkFarcasterAccount(id: number, fid: number, username: string, avatar?: string): Promise<User | undefined>;
    getOrCreateFarcasterUser(fid: number, username: string, displayName: string, avatar?: string, score?: number): Promise<User>;
    getAllUsers(): Promise<User[]>;
    getAllTips(): Promise<Tip[]>;
    getTipStats(): Promise<{
        totalTips: number;
        totalAmount: {
            [key: string]: number;
        };
        totalFees: {
            [key: string]: number;
        };
        tipsByBlockchain: {
            [key: string]: number;
        };
    }>;
    getTipsByDate(startDate?: Date, endDate?: Date): Promise<{
        date: string;
        count: number;
    }[]>;
    getNotificationService(): NotificationService;
    createDevStatsShare(users: any[]): Promise<string>;
    getDevStatsShare(id: string): Promise<any[] | null>;
    cleanupExpiredDevStatsShares(): Promise<number>;
    getWalletSessionMapping(sessionId: string): Promise<{
        userId: string;
        createdAt: Date;
        lastUsed: Date;
    } | undefined>;
    createWalletSessionMapping(sessionId: string, userId: string): Promise<void>;
    updateWalletSessionLastUsed(sessionId: string): Promise<void>;
    cleanupExpiredWalletSessions(): Promise<number>;
}
export declare const storage: DatabaseStorage;
export { notificationService };
//# sourceMappingURL=storage.d.ts.map