// @ts-ignore - Missing type declarations for drizzle-orm
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// Users table - for developers who want to receive tips
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    githubId: text("github_id").unique(),
    githubUsername: text("github_username"),
    githubAvatar: text("github_avatar"),
    customProfilePicture: text("custom_profile_picture"),
    githubBio: text("github_bio"),
    // Farcaster account information
    fid: integer("fid").unique(), // Farcaster ID
    farcasterUsername: text("farcaster_username"),
    farcasterAvatar: text("farcaster_avatar"),
    score: integer("score"), // Neynar user score (stable field)
    // Blockchain addresses
    solanaAddress: text("solana_address"),
    ethereumAddress: text("ethereum_address"),
    ethereumSplitAddress: text("ethereum_split_address"),
    ethereumSplitDeploymentStatus: text("ethereum_split_deployment_status"),
    ethereumSplitDeploymentTimestamp: timestamp("ethereum_split_deployment_timestamp"),
    bitcoinLightningAddress: text("bitcoin_lightning_address"),
    isAdmin: boolean("is_admin").default(false), // Flag for admin users
    createdAt: timestamp("created_at").defaultNow(),
});
// Tips table - to track tips sent to developers
export const tips = pgTable("tips", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    amount: text("amount").notNull(),
    platformFee: text("platform_fee"), // The platform fee amount
    platformFeePercentage: text("platform_fee_percentage"), // The fee percentage used
    message: text("message"),
    senderName: text("sender_name"),
    senderAvatar: text("sender_avatar"),
    blockchain: text("blockchain").notNull(),
    token: text("token"), // The token used for the tip (ETH, SOL, USDC, etc.)
    transactionHash: text("transaction_hash"),
    usdValue: text("usd_value"), // The USD value at time of receipt
    status: text("status"), // Payment status (e.g., "paid", "expired", "pending")
    // App-related fields for app tips (optional)
    appId: text("app_id"), // frames_url for app tips (e.g., "https://tipnearn.com")
    appName: text("app_name"), // App display name (e.g., "Tipn")
    appIconUrl: text("app_icon_url"), // App icon URL for display
    recipientType: text("recipient_type"), // "user" or "app" to distinguish tip types
    createdAt: timestamp("created_at").defaultNow(),
});
// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
    createdAt: true,
});
export const insertTipSchema = createInsertSchema(tips).omit({
    id: true,
    createdAt: true,
});
// Auth Schema
export const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
export const registerSchema = loginSchema.extend({
    username: z.string().min(3, "Username must be at least 3 characters"),
});
export const githubAuthSchema = z.object({
    code: z.string(),
});
// Schema for blockchain settings
export const blockchainSettingsSchema = z.object({
    blockchain: z.enum(["ethereum", "solana", "bitcoin"]),
    feePercentage: z.number().min(0).max(10),
    platformWallet: z.string().optional(),
    contractAddress: z.string().optional(),
    programId: z.string().optional(),
    networkMode: z.enum(["testnet", "mainnet"]).default("testnet"),
});
