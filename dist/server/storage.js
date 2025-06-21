import session from "express-session";
import createMemoryStore from "memorystore";
import { getDb, isUsingInMemoryMode } from "./db.js";
import MongoStore from "connect-mongo";
// Ntfy notification service implementation
// Environment variables required:
// - NTFY_BASE_URL: Base URL for your ntfy server (e.g., 'https://ntfy.sh' or 'https://your-ntfy.com')
// - NTFY_AUTH_TOKEN: Authentication token for sending notifications (recommended)
// - NTFY_TOPIC_PREFIX: Unique prefix for your topics (optional, defaults to 'td')
// 
// Topic structure (using consistent unique names):
// - {base}/{prefix}-new-users: New user registrations
// - {base}/{prefix}-new-tips: New tip transactions  
// - {base}/{prefix}-notifs: General notifications
//
// IMPORTANT: Using FREE ntfy.sh (public topics):
// - Anyone who discovers topic names can subscribe and see notifications
// - NTFY_AUTH_TOKEN prevents others from SENDING to your topics
// - Use unique NTFY_TOPIC_PREFIX for security (e.g., 'myapp-prod-xyz123')
// - Be careful about sensitive data in notification messages
//
// Setup for DigitalOcean deployment:
// 1. Set NTFY_BASE_URL=https://ntfy.sh in your environment variables
// 2. Create ntfy.sh account → generate access token → set NTFY_AUTH_TOKEN=tk_xxx
// 3. Set NTFY_TOPIC_PREFIX=your-unique-prefix (e.g., 'gitipstream-prod-abc123')
// 4. iOS app: Subscribe to your topics: {prefix}-new-users, {prefix}-new-tips, {prefix}-notifs
//
// Security recommendations for public topics:
// 1. Use unique NTFY_TOPIC_PREFIX (change from default 'td')
// 2. Minimize sensitive data in notifications (remove amounts, names, etc.)
// 3. Consider using a private ntfy server for production
// 4. NTFY_AUTH_TOKEN still recommended to prevent others from sending fake notifications
class NtfyNotificationService {
    baseUrl;
    authToken;
    newUsersTopicUrl;
    newTipsTopicUrl;
    notifsTopicUrl;
    constructor() {
        // Require explicit configuration - no default public topics
        this.baseUrl = process.env.NTFY_BASE_URL;
        this.authToken = process.env.NTFY_AUTH_TOKEN;
        console.log(`[${new Date().toISOString()}] [Ntfy] Initializing notification service...`);
        console.log(`[${new Date().toISOString()}] [Ntfy] Base URL: ${this.baseUrl || 'NOT_SET'}`);
        console.log(`[${new Date().toISOString()}] [Ntfy] Auth Token: ${this.authToken ? 'SET' : 'NOT_SET'}`);
        if (this.baseUrl) {
            // Remove trailing slash if present
            const cleanBaseUrl = this.baseUrl.replace(/\/$/, '');
            // Use environment variable for topic prefix or default to 'td'
            const topicPrefix = process.env.NTFY_TOPIC_PREFIX || 'td';
            console.log(`[${new Date().toISOString()}] [Ntfy] Topic prefix: ${topicPrefix}`);
            // Set up topic URLs with consistent names
            this.newUsersTopicUrl = `${cleanBaseUrl}/${topicPrefix}-new-users`;
            this.newTipsTopicUrl = `${cleanBaseUrl}/${topicPrefix}-new-tips`;
            this.notifsTopicUrl = `${cleanBaseUrl}/${topicPrefix}-notifs`;
            console.log(`[${new Date().toISOString()}] [Ntfy] New users topic: ${this.newUsersTopicUrl}`);
            console.log(`[${new Date().toISOString()}] [Ntfy] New tips topic: ${this.newTipsTopicUrl}`);
            console.log(`[${new Date().toISOString()}] [Ntfy] Notifications topic: ${this.notifsTopicUrl}`);
        }
        // Validate configuration
        if (!this.baseUrl) {
            console.warn(`[${new Date().toISOString()}] [Ntfy] NTFY_BASE_URL not configured - notifications disabled`);
        }
        else if (this.baseUrl.includes('ntfy.sh') && !this.authToken) {
            console.error(`[${new Date().toISOString()}] [Ntfy] WARNING: Using public ntfy.sh without authentication - this is a security risk!`);
            console.error(`[${new Date().toISOString()}] [Ntfy] Either set NTFY_AUTH_TOKEN or use a private ntfy server`);
        }
        else {
            console.log(`[${new Date().toISOString()}] [Ntfy] Notification service ready`);
        }
    }
    async sendNotification(topicUrl, title, body, tags, priority = 'default') {
        try {
            console.log(`[${new Date().toISOString()}] [Ntfy] Sending notification to ${topicUrl}`);
            console.log(`[${new Date().toISOString()}] [Ntfy] Title: ${title}`);
            console.log(`[${new Date().toISOString()}] [Ntfy] Body: ${body}`);
            console.log(`[${new Date().toISOString()}] [Ntfy] Tags: ${tags}`);
            const headers = {
                'Title': title,
                'Tags': tags,
                'Priority': priority
            };
            if (this.authToken) {
                headers['Authorization'] = `Bearer ${this.authToken}`;
                console.log(`[${new Date().toISOString()}] [Ntfy] Using authentication token`);
            }
            else {
                console.log(`[${new Date().toISOString()}] [Ntfy] No authentication token`);
            }
            const response = await fetch(topicUrl, {
                method: 'POST',
                headers,
                body
            });
            if (response.ok) {
                console.log(`[${new Date().toISOString()}] [Ntfy] Notification sent successfully`);
            }
            else {
                console.error(`[${new Date().toISOString()}] [Ntfy] Failed to send notification: ${response.status} ${response.statusText}`);
            }
        }
        catch (error) {
            console.error(`[${new Date().toISOString()}] [Ntfy] Failed to send notification to ${topicUrl}:`, error);
            // Fail silently - don't break the main operation
        }
    }
    async notifyUserCreated(username, source) {
        console.log(`[${new Date().toISOString()}] [Ntfy] notifyUserCreated called for ${username} via ${source}`);
        if (!this.newUsersTopicUrl) {
            console.log(`[${new Date().toISOString()}] [Ntfy] Notifications disabled - no topic URL configured`);
            return; // Notifications disabled
        }
        await this.sendNotification(this.newUsersTopicUrl, 'New User Registered', `${username} added via ${source}`, 'new,bust_in_silhouette');
    }
    async notifyNotificationSent(targetFids, title) {
        if (!this.notifsTopicUrl) {
            return; // Notifications disabled
        }
        await this.sendNotification(this.notifsTopicUrl, 'Welcome Notification', `Notification "${title}" sent to ${targetFids.length} user(s): ${targetFids.join(', ')}`, 'mega');
    }
    async notifyTipCreated(amount, blockchain, usdValue, platformFee, recipientUsername, senderName) {
        console.log(`[${new Date().toISOString()}] [Ntfy] notifyTipCreated called for ${amount} ${blockchain} tip`);
        if (!this.newTipsTopicUrl) {
            console.log(`[${new Date().toISOString()}] [Ntfy] Notifications disabled - no topic URL configured`);
            return; // Notifications disabled
        }
        // Build notification message with USD value, platform fee, sender and recipient
        let message = `New ${amount} ${blockchain} tip`;
        if (senderName && recipientUsername) {
            message += ` from ${senderName} to ${recipientUsername}`;
        }
        else if (senderName) {
            message += ` from ${senderName}`;
        }
        else if (recipientUsername) {
            message += ` for ${recipientUsername}`;
        }
        if (usdValue) {
            const usdAmount = parseFloat(usdValue);
            const platformFeeAmount = (usdAmount * 0.04).toFixed(2); // 4% platform fee
            message += ` ($${usdValue} USD, platform fee: $${platformFeeAmount})`;
        }
        await this.sendNotification(this.newTipsTopicUrl, 'New Tip', message, 'new,moneybag');
    }
}
const MemoryStore = createMemoryStore(session);
// Create notification service instance
const notificationService = new NtfyNotificationService();
export class DatabaseStorage {
    sessionStore;
    constructor() {
        // Use in-memory session store for development
        if (!process.env.MONGODB_URI || isUsingInMemoryMode()) {
            this.sessionStore = new MemoryStore({
                checkPeriod: 86400000 // 24 hours
            });
            // console.log("Using in-memory session store");
        }
        else {
            // Use MongoDB for session store
            this.sessionStore = MongoStore.create({
                mongoUrl: process.env.MONGODB_URI,
                dbName: process.env.DB_NAME || "tip_md",
                collectionName: "sessions",
                ttl: 14 * 24 * 60 * 60, // 14 days
                crypto: {
                    secret: process.env.SESSION_SECRET || "tip-md-development-secret"
                },
                autoRemove: 'native',
                mongoOptions: {
                    ssl: true,
                    tls: true,
                    tlsAllowInvalidCertificates: false,
                    minPoolSize: 0,
                    maxPoolSize: 10,
                    serverSelectionTimeoutMS: 30000,
                    socketTimeoutMS: 45000
                }
            });
            // console.log("Using MongoDB session store");
        }
    }
    async getUser(id) {
        const db = getDb();
        const user = await db.collection("users").findOne({ id });
        return user || undefined;
    }
    async getUserByUsername(username) {
        const db = getDb();
        const user = await db.collection("users").findOne({ username });
        return user || undefined;
    }
    async getUserByGithubId(githubId) {
        const db = getDb();
        const user = await db.collection("users").findOne({ githubId });
        return user || undefined;
    }
    async getUserByGithubUsername(githubUsername) {
        const db = getDb();
        const user = await db.collection("users").findOne({ githubUsername });
        return user || undefined;
    }
    async getUserByEmail(email) {
        const db = getDb();
        const user = await db.collection("users").findOne({ email });
        return user || undefined;
    }
    async getUserByFid(fid) {
        const db = getDb();
        const user = await db.collection("users").findOne({ fid });
        return user || undefined;
    }
    async getUserByEthereumAddress(address) {
        const db = getDb();
        const user = await db.collection("users").findOne({ ethereumAddress: address });
        return user || undefined;
    }
    async getUserBySolanaAddress(address) {
        const db = getDb();
        const user = await db.collection("users").findOne({ solanaAddress: address });
        return user || undefined;
    }
    async createUser(insertUser) {
        const db = getDb();
        // Generate a numeric ID to maintain compatibility with the existing schema
        const lastUser = await db.collection("users").findOne({}, { sort: { id: -1 } });
        const newId = (lastUser?.id || 0) + 1;
        // Create base user data
        const userData = {
            ...insertUser,
            id: newId,
            createdAt: new Date(),
        };
        // For email registrations (non-GitHub login), we need to OMIT the githubId field entirely
        // rather than setting it to null, to avoid the duplicate key error with sparse indexes
        if (insertUser.githubId) {
            // Only set githubId if it has an actual value
            userData.githubId = insertUser.githubId;
        }
        // Set other nullable fields, but still allow them to be null
        userData.githubUsername = insertUser.githubUsername || null;
        userData.githubAvatar = insertUser.githubAvatar || null;
        userData.githubBio = insertUser.githubBio || null;
        userData.solanaAddress = insertUser.solanaAddress || null;
        userData.ethereumAddress = insertUser.ethereumAddress || null;
        userData.bitcoinLightningAddress = insertUser.bitcoinLightningAddress || null;
        // Handle Farcaster fields if provided
        if (insertUser.fid) {
            userData.fid = insertUser.fid;
            userData.farcasterUsername = insertUser.farcasterUsername || null;
            userData.farcasterAvatar = insertUser.farcasterAvatar || null;
        }
        // Handle Neynar score if provided
        if (typeof insertUser.score === 'number') {
            userData.score = insertUser.score;
        }
        // console.log("Creating user:", { 
        //   ...userData, 
        //   password: userData.password ? '***' : null,
        //   hasGithubId: !!userData.githubId 
        // });
        const result = await db.collection("users").insertOne(userData);
        const user = await db.collection("users").findOne({ _id: result.insertedId });
        // Send notification (non-blocking)
        const source = insertUser.githubId ? 'GitHub OAuth' :
            insertUser.fid ? 'Farcaster' : 'Manual Registration';
        notificationService.notifyUserCreated(user.username, source).catch(err => {
            console.error('Notification failed for user:', user.username, err);
        });
        return user;
    }
    async updateUser(id, data) {
        const db = getDb();
        const result = await db.collection("users").findOneAndUpdate({ id }, { $set: data }, { returnDocument: "after" });
        return result || undefined;
    }
    async deleteUser(id) {
        const db = getDb();
        // First delete all tips associated with this user
        await db.collection("tips").deleteMany({ userId: id });
        // Then delete the user
        const result = await db.collection("users").deleteOne({ id });
        return result.deletedCount > 0;
    }
    async getTipsByUserId(userId) {
        const db = getDb();
        const tips = await db.collection("tips").find({ userId }).toArray();
        return tips;
    }
    async createTip(insertTip) {
        const db = getDb();
        // Generate a numeric ID to maintain compatibility with the existing schema
        const lastTip = await db.collection("tips").findOne({}, { sort: { id: -1 } });
        const newId = (lastTip?.id || 0) + 1;
        // Ensure all nullable fields are explicitly set to null if not provided
        const tipData = {
            ...insertTip,
            id: newId,
            createdAt: new Date(),
            message: insertTip.message || null,
            senderName: insertTip.senderName || null,
            senderAvatar: insertTip.senderAvatar || null,
            transactionHash: insertTip.transactionHash || null,
            platformFee: insertTip.platformFee || null,
            platformFeePercentage: insertTip.platformFeePercentage || null,
            token: insertTip.token || null, // Properly handle the token field
            usdValue: insertTip.usdValue || null,
            status: insertTip.status || null,
            // Handle app fields for app tips (all optional)
            appId: insertTip.appId || null,
            appName: insertTip.appName || null,
            appIconUrl: insertTip.appIconUrl || null,
            recipientType: insertTip.recipientType || null
        };
        const result = await db.collection("tips").insertOne(tipData);
        const tip = await db.collection("tips").findOne({ _id: result.insertedId });
        // Send notification (non-blocking)
        const recipient = await this.getUser(insertTip.userId);
        notificationService.notifyTipCreated(insertTip.amount, insertTip.blockchain, insertTip.usdValue || undefined, insertTip.platformFee || undefined, recipient?.username, insertTip.senderName || undefined).catch(err => {
            console.error('Notification failed for tip:', insertTip.amount, err);
        });
        return tip;
    }
    async getTipById(id) {
        const db = await getDb();
        const result = await db.collection("tips").findOne({ id });
        return result ? result : undefined;
    }
    async updateTip(id, data) {
        const db = await getDb();
        await db.collection("tips").updateOne({ id }, { $set: data });
        const updatedTip = await db.collection("tips").findOne({ id });
        return updatedTip ? updatedTip : undefined;
    }
    async updateUserBitcoinStats(userId, amount) {
        const db = await getDb();
        const user = await db.collection("users").findOne({ id: userId });
        if (!user)
            return undefined;
        const bitcoinTipsReceived = (user.bitcoinTipsReceived || 0) + 1;
        const bitcoinTotalAmount = (parseFloat(user.bitcoinTotalAmount || "0") + amount).toString();
        await db.collection("users").updateOne({ id: userId }, { $set: { bitcoinTipsReceived, bitcoinTotalAmount } });
        return await this.getUser(userId);
    }
    async linkFarcasterAccount(id, fid, username, avatar) {
        try {
            // Check if FID is already linked to a user
            const existingFidUser = await this.getUserByFid(fid);
            if (existingFidUser && existingFidUser.id !== id) {
                throw new Error(`FID ${fid} is already linked to another user`);
            }
            // Update user with Farcaster data
            const updatedUser = await this.updateUser(id, {
                fid,
                farcasterUsername: username,
                farcasterAvatar: avatar || null,
                // Store PFP in githubAvatar field so it displays in UserAvatar component
                githubAvatar: avatar || null
            });
            return updatedUser;
        }
        catch (error) {
            console.error('Error linking Farcaster to user:', error);
            return undefined;
        }
    }
    async getOrCreateFarcasterUser(fid, username, displayName, avatar, score) {
        try {
            // Fire-and-forget GitCast initialization for all Farcaster users (new and existing)
            fetch('https://api.gitcast.dev/initialize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fid })
            }).catch(error => {
                console.error('GitCast initialization failed (non-blocking):', error);
            });
            // Step 1: First, check if user exists by FID
            let user = await this.getUserByFid(fid);
            if (user) {
                console.log(`[Storage] Found existing user by FID ${fid}:`, user.id);
                return user;
            }
            // Step 2: User doesn't exist by FID, check for GitHub verification via Warpcast API
            console.log(`[Storage] User not found by FID ${fid}, checking Warpcast GitHub verification...`);
            const { getGithubVerification } = await import('./warpcastVerificationService.js');
            const githubUsername = await getGithubVerification(fid);
            if (githubUsername) {
                // Step 3: GitHub username found, check if user with this GitHub username already exists
                console.log(`[Storage] GitHub verification found: ${githubUsername}, checking for existing user...`);
                const existingGithubUser = await this.getUserByGithubUsername(githubUsername);
                if (existingGithubUser) {
                    // Step 4: Existing GitHub user found, link FID to this user
                    console.log(`[Storage] Found existing GitHub user: ${existingGithubUser.id}, linking FID ${fid}...`);
                    const linkedUser = await this.linkFarcasterAccount(existingGithubUser.id, fid, username, avatar);
                    if (linkedUser) {
                        console.log(`[Storage] Successfully linked FID ${fid} to existing GitHub user ${githubUsername}`);
                        return linkedUser;
                    }
                }
            }
            // Step 5: No existing GitHub user found (or no GitHub verification), create new user with GitHub username if available
            console.log(`[Storage] Creating new user with FID ${fid}${githubUsername ? ` and GitHub username ${githubUsername}` : ''}...`);
            // Prepare user data for creation
            const userData = {
                username: githubUsername || username,
                email: `${githubUsername || username}-${fid}@farcaster.user`,
                password: `farcaster-${fid}-${Date.now()}`,
                fid,
                farcasterUsername: username,
                farcasterAvatar: avatar || null,
                githubAvatar: avatar || null,
                githubUsername: githubUsername || null
            };
            // Include score if provided
            if (typeof score === 'number') {
                userData.score = score;
            }
            const newUser = await this.createUser(userData);
            console.log(`[Storage] Created new user with FID ${fid}:`, newUser.id);
            return newUser;
        }
        catch (error) {
            console.error('[Storage] Error in getOrCreateFarcasterUser:', error);
            throw new Error('Failed to get or create Farcaster user');
        }
    }
    async getAllUsers() {
        const db = await getDb();
        const users = await db.collection("users").find().sort({ id: 1 }).toArray();
        return users;
    }
    async getAllTips() {
        const db = await getDb();
        const tips = await db.collection("tips").find().sort({ id: -1 }).toArray();
        return tips;
    }
    async getTipStats() {
        const db = await getDb();
        const tips = await db.collection("tips").find().toArray();
        const stats = {
            totalTips: tips.length,
            totalAmount: {},
            totalFees: {},
            tipsByBlockchain: {}
        };
        for (const tip of tips) {
            // Count by blockchain
            const blockchain = tip.blockchain;
            stats.tipsByBlockchain[blockchain] = (stats.tipsByBlockchain[blockchain] || 0) + 1;
            // Sum amounts by currency/blockchain
            // This is a simplified approach - in reality, you might want to 
            // normalize by converting to a common currency like USD
            const amountValue = parseFloat(tip.amount);
            if (!isNaN(amountValue)) {
                stats.totalAmount[blockchain] = (stats.totalAmount[blockchain] || 0) + amountValue;
            }
            // Sum fees by currency/blockchain
            if (tip.platformFee) {
                const feeValue = parseFloat(tip.platformFee);
                if (!isNaN(feeValue)) {
                    stats.totalFees[blockchain] = (stats.totalFees[blockchain] || 0) + feeValue;
                }
            }
        }
        return stats;
    }
    async getTipsByDate(startDate, endDate) {
        const db = await getDb();
        // Set default date range if not provided
        const end = endDate || new Date();
        const start = startDate || new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
        // Query tips within date range
        const tips = await db.collection("tips").find({
            createdAt: { $gte: start, $lte: end }
        }).toArray();
        // Group tips by date
        const dateMap = new Map();
        tips.forEach((tip) => {
            if (tip.createdAt) {
                const date = new Date(tip.createdAt).toISOString().split('T')[0]; // Format as YYYY-MM-DD
                dateMap.set(date, (dateMap.get(date) || 0) + 1);
            }
        });
        // Fill in dates with no tips
        const result = [];
        const currentDate = new Date(start);
        while (currentDate <= end) {
            const dateString = currentDate.toISOString().split('T')[0];
            result.push({
                date: dateString,
                count: dateMap.get(dateString) || 0
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return result.sort((a, b) => a.date.localeCompare(b.date));
    }
    getNotificationService() {
        return notificationService;
    }
    async createDevStatsShare(users) {
        const db = getDb();
        // Generate a unique short ID for sharing
        const { nanoid } = await import('nanoid');
        const shareId = nanoid(10); // Short ID like "V1StGXR8_Z"
        const shareData = {
            _id: shareId,
            users,
            createdAt: new Date(),
            // Auto-expire after 30 days
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
        await db.collection("dev_stats_shares").insertOne(shareData);
        return shareId;
    }
    async getDevStatsShare(id) {
        const db = getDb();
        const shareData = await db.collection("dev_stats_shares").findOne({
            _id: id,
            // Check if not expired
            expiresAt: { $gt: new Date() }
        });
        return shareData ? shareData.users : null;
    }
    async cleanupExpiredDevStatsShares() {
        const db = getDb();
        const result = await db.collection("dev_stats_shares").deleteMany({
            expiresAt: { $lte: new Date() }
        });
        return result.deletedCount || 0;
    }
    async getWalletSessionMapping(sessionId) {
        const db = getDb();
        const mapping = await db.collection("wallet_sessions").findOne({ sessionId });
        return mapping ? {
            userId: mapping.userId,
            createdAt: mapping.createdAt,
            lastUsed: mapping.lastUsed
        } : undefined;
    }
    async createWalletSessionMapping(sessionId, userId) {
        const db = getDb();
        await db.collection("wallet_sessions").insertOne({
            sessionId,
            userId,
            createdAt: new Date(),
            lastUsed: new Date()
        });
    }
    async updateWalletSessionLastUsed(sessionId) {
        const db = getDb();
        await db.collection("wallet_sessions").updateOne({ sessionId }, { $set: { lastUsed: new Date() } });
    }
    async cleanupExpiredWalletSessions() {
        const db = getDb();
        // Remove sessions older than 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const result = await db.collection("wallet_sessions").deleteMany({
            lastUsed: { $lt: thirtyDaysAgo }
        });
        return result.deletedCount || 0;
    }
}
// Export a single instance of the storage implementation
export const storage = new DatabaseStorage();
// Export notification service for use in routes
export { notificationService };
