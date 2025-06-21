import { MongoClient } from "mongodb";
// MongoDB Connection URL - Using a default value for local development
const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = process.env.DB_NAME || "tip_md";
// Create a MongoDB client if URI is provided
let client = null;
if (MONGODB_URI) {
    client = new MongoClient(MONGODB_URI, {
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: false,
        minPoolSize: 0,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
    });
}
// Database connection
let db = null;
// Flag to determine if using in-memory mode
let isInMemoryMode = false;
// Simple in-memory database implementation
class InMemoryDb {
    collections;
    constructor() {
        this.collections = {};
    }
    collection(name) {
        if (!this.collections[name]) {
            this.collections[name] = new InMemoryCollection(name);
        }
        return this.collections[name];
    }
}
// Simple in-memory collection implementation
class InMemoryCollection {
    name;
    documents;
    nextId;
    constructor(name) {
        this.name = name;
        this.documents = {};
        this.nextId = 1;
    }
    async createIndex() {
        // Mock implementation, does nothing
        // console.log(`In-memory: createIndex called for ${this.name}`);
        return true;
    }
    async insertOne(doc) {
        const id = doc._id || this.nextId++;
        const _id = id.toString();
        const document = { ...doc, _id };
        this.documents[_id] = document;
        return { insertedId: _id, acknowledged: true };
    }
    async findOne(query = {}) {
        if (query._id) {
            return this.documents[query._id.toString()] || null;
        }
        // Simple query matching
        for (const id in this.documents) {
            const doc = this.documents[id];
            let match = true;
            for (const key in query) {
                if (doc[key] !== query[key]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                return doc;
            }
        }
        return null;
    }
    async findOneAndUpdate(query, update, options = {}) {
        const doc = await this.findOne(query);
        if (!doc)
            return null;
        const updatedDoc = { ...doc };
        if (update.$set) {
            for (const key in update.$set) {
                updatedDoc[key] = update.$set[key];
            }
        }
        this.documents[updatedDoc._id.toString()] = updatedDoc;
        return updatedDoc;
    }
    async updateOne(query, update) {
        const doc = await this.findOne(query);
        if (!doc) {
            return { matchedCount: 0, modifiedCount: 0, acknowledged: true };
        }
        const updatedDoc = { ...doc };
        if (update.$set) {
            for (const key in update.$set) {
                updatedDoc[key] = update.$set[key];
            }
        }
        this.documents[updatedDoc._id.toString()] = updatedDoc;
        return { matchedCount: 1, modifiedCount: 1, acknowledged: true };
    }
    find(query = {}) {
        const matches = [];
        for (const id in this.documents) {
            const doc = this.documents[id];
            let match = true;
            for (const key in query) {
                if (doc[key] !== query[key]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                matches.push(doc);
            }
        }
        return {
            toArray: async () => matches,
            // Basic sort mock: assumes query._id is used or no sort specific field
            sort: (sortQuery) => ({
                limit: (limitNum) => ({
                    toArray: async () => {
                        let sortedMatches = [...matches];
                        if (sortQuery) {
                            const sortKey = Object.keys(sortQuery)[0];
                            const sortOrder = sortQuery[sortKey]; // 1 for asc, -1 for desc
                            sortedMatches.sort((a, b) => {
                                if (a[sortKey] < b[sortKey])
                                    return -1 * sortOrder;
                                if (a[sortKey] > b[sortKey])
                                    return 1 * sortOrder;
                                return 0;
                            });
                        }
                        return sortedMatches.slice(0, limitNum);
                    }
                }),
                toArray: async () => {
                    // Simpler toArray without limit for direct sort().toArray()
                    let sortedMatches = [...matches];
                    if (sortQuery) {
                        const sortKey = Object.keys(sortQuery)[0];
                        const sortOrder = sortQuery[sortKey];
                        sortedMatches.sort((a, b) => {
                            if (a[sortKey] < b[sortKey])
                                return -1 * sortOrder;
                            if (a[sortKey] > b[sortKey])
                                return 1 * sortOrder;
                            return 0;
                        });
                    }
                    return sortedMatches;
                }
            })
        };
    }
}
// Connect to MongoDB or fallback to in-memory
export async function connectToDatabase() {
    try {
        if (!MONGODB_URI || !client) {
            // console.log("MongoDB URI not provided, using in-memory database for development");
            db = new InMemoryDb();
            isInMemoryMode = true;
            await initializeCollections(); // Also call for in-memory to register collections
            return { db, isInMemoryMode };
        }
        // Connect the client to the server
        await client.connect();
        // console.log("Connected successfully to MongoDB");
        // Get the database
        db = client.db(DB_NAME);
        // Initialize collections
        await initializeCollections();
        return { db, client };
    }
    catch (error) {
        console.error("Failed to connect to MongoDB, falling back to in-memory database:", error);
        db = new InMemoryDb();
        isInMemoryMode = true;
        await initializeCollections(); // Ensure in-memory also gets "collections"
        return { db, isInMemoryMode };
    }
}
// Initialize collections with indexes if needed
async function initializeCollections() {
    if (!db) {
        console.error("DB not initialized before initializeCollections call");
        return;
    }
    const collectionsToEnsure = [
        {
            name: "users",
            indexes: [
                { spec: { username: 1 }, options: { unique: true } },
                { spec: { email: 1 }, options: { unique: true } },
                { spec: { githubId: 1 }, options: { unique: true, sparse: true, name: "githubId_1_sparse" } },
            ],
        },
        {
            name: "tips",
            indexes: [{ spec: { userId: 1 }, options: {} }],
        },
        {
            name: "trending_repositories",
            indexes: [
                { spec: { github_id: 1 }, options: { unique: true, sparse: true, name: "github_id_1_trending_repo_sparse" } },
                { spec: { period: 1, language: 1, trend_date: -1, rank: 1 }, options: { name: "period_lang_date_rank_trending_repo" } },
                { spec: { full_name: 1, period: 1, trend_date: 1, language: 1 }, options: { name: "fullname_period_date_lang_trending_repo" } }, // For scraper upsert
            ],
            optional: true, // Mark trending collections as optional for startup
        },
        {
            name: "trending_developers",
            indexes: [
                { spec: { github_id: 1 }, options: { unique: true, sparse: true, name: "github_id_1_trending_dev_sparse" } },
                { spec: { username: 1, period: 1, trend_date: 1, language: 1 }, options: { name: "username_period_date_lang_trending_dev" } }, // For scraper upsert
                { spec: { period: 1, language: 1, trend_date: -1, rank: 1 }, options: { name: "period_lang_date_rank_trending_dev" } },
            ],
            optional: true, // Mark trending collections as optional for startup
        },
        {
            name: "scrape_status",
            indexes: [
                { spec: { scrape_type: 1, period: 1, language: 1 }, options: { name: "scrape_type_period_lang_status" } },
            ],
            optional: true, // Mark trending collections as optional for startup
        },
        {
            name: "github_verifications",
            indexes: [
                { spec: { platformUsername: 1 }, options: { unique: true, name: "github_username_unique" } },
                { spec: { fid: 1 }, options: { name: "fid_index" } },
                { spec: { updatedAt: 1 }, options: { name: "updated_at_index" } },
            ],
            optional: true, // Mark as optional for startup
        },
    ];
    for (const collInfo of collectionsToEnsure) {
        try {
            const collection = db.collection(collInfo.name);
            // console.log(`Ensuring indexes for collection: ${collInfo.name}`);
            if (collInfo.indexes && collInfo.indexes.length > 0) {
                for (const index of collInfo.indexes) {
                    // In-memory mock doesn't need specific index creation beyond registering collection
                    if (!isInMemoryMode) {
                        try {
                            await collection.createIndex(index.spec, index.options);
                        }
                        catch (indexError) {
                            if (collInfo.optional) {
                                // For optional collections (trending), just warn and continue
                                console.warn(`Warning: Failed to create index for optional collection ${collInfo.name}:`, indexError);
                                console.log(`App will continue without this index. Use admin dashboard to trigger manual indexing.`);
                            }
                            else {
                                // For critical collections (users, tips), re-throw the error
                                throw indexError;
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            if (collInfo.optional) {
                // For optional collections, log warning but don't fail startup
                console.warn(`Warning: Failed to initialize optional collection ${collInfo.name}:`, error);
                console.log(`App will continue without this collection. Use admin dashboard to trigger setup.`);
            }
            else {
                // For critical collections, log error but still allow app to continue
                console.error(`Error initializing collection ${collInfo.name} or its indexes:`, error);
                console.log(`App will continue with degraded functionality for ${collInfo.name}.`);
            }
        }
    }
}
// Get the database instance
export function getDb() {
    if (!db) {
        throw new Error("Database not initialized. Call connectToDatabase first.");
    }
    return db;
}
// Check if using in-memory mode
export function isUsingInMemoryMode() {
    return isInMemoryMode;
}
// Manually initialize trending collections and indexes (for admin dashboard use)
export async function initializeTrendingCollections() {
    if (!db || isInMemoryMode) {
        console.log("Skipping trending collection initialization - using in-memory mode");
        return { success: true, message: "In-memory mode - no indexes needed" };
    }
    const trendingCollections = [
        {
            name: "trending_repositories",
            indexes: [
                { spec: { github_id: 1 }, options: { unique: true, sparse: true, name: "github_id_1_trending_repo_sparse" } },
                { spec: { period: 1, language: 1, trend_date: -1, rank: 1 }, options: { name: "period_lang_date_rank_trending_repo" } },
                { spec: { full_name: 1, period: 1, trend_date: 1, language: 1 }, options: { name: "fullname_period_date_lang_trending_repo" } },
            ],
        },
        {
            name: "trending_developers",
            indexes: [
                { spec: { github_id: 1 }, options: { unique: true, sparse: true, name: "github_id_1_trending_dev_sparse" } },
                { spec: { username: 1, period: 1, trend_date: 1, language: 1 }, options: { name: "username_period_date_lang_trending_dev" } },
                { spec: { period: 1, language: 1, trend_date: -1, rank: 1 }, options: { name: "period_lang_date_rank_trending_dev" } },
            ],
        },
        {
            name: "scrape_status",
            indexes: [
                { spec: { scrape_type: 1, period: 1, language: 1 }, options: { name: "scrape_type_period_lang_status" } },
            ],
        },
        {
            name: "github_verifications",
            indexes: [
                { spec: { platformUsername: 1 }, options: { unique: true, name: "github_username_unique" } },
                { spec: { fid: 1 }, options: { name: "fid_index" } },
                { spec: { updatedAt: 1 }, options: { name: "updated_at_index" } },
            ],
        },
    ];
    const results = [];
    let hasErrors = false;
    for (const collInfo of trendingCollections) {
        try {
            const collection = db.collection(collInfo.name);
            console.log(`Initializing trending collection: ${collInfo.name}`);
            if (collInfo.indexes && collInfo.indexes.length > 0) {
                for (const index of collInfo.indexes) {
                    try {
                        await collection.createIndex(index.spec, index.options);
                        console.log(`✅ Created index ${index.options?.name || 'unnamed'} for ${collInfo.name}`);
                    }
                    catch (indexError) {
                        // Handle duplicate key errors gracefully (index already exists)
                        if (indexError.code === 11000 || indexError.codeName === 'IndexOptionsConflict' || indexError.message?.includes('already exists')) {
                            console.log(`ℹ️  Index ${index.options?.name || 'unnamed'} already exists for ${collInfo.name}`);
                        }
                        else {
                            console.error(`❌ Failed to create index ${index.options?.name || 'unnamed'} for ${collInfo.name}:`, indexError);
                            hasErrors = true;
                            results.push(`Failed to create index ${index.options?.name || 'unnamed'} for ${collInfo.name}: ${indexError.message}`);
                        }
                    }
                }
            }
            results.push(`✅ Collection ${collInfo.name} initialized successfully`);
        }
        catch (error) {
            console.error(`❌ Failed to initialize collection ${collInfo.name}:`, error);
            hasErrors = true;
            results.push(`Failed to initialize collection ${collInfo.name}: ${error.message}`);
        }
    }
    return {
        success: !hasErrors,
        message: hasErrors ? "Some indexes failed to create" : "All trending collections and indexes initialized successfully",
        details: results
    };
}
// Close the connection
export async function closeConnection() {
    if (client) {
        await client.close();
        //console.log("MongoDB connection closed");
    }
}
