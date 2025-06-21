import { MongoClient, ServerApiVersion, Db } from 'mongodb';
import dotenv from 'dotenv';
// import { logger } from '../src/index.js'; // REMOVED Import
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Added local logger
const dbLogger = {
  info: (...args: any[]) => console.log('[DB Connection]', ...args),
  error: (...args: any[]) => console.error('[DB Connection ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[DB Connection WARN]', ...args),
  debug: (...args: any[]) => process.env.NODE_ENV !== 'production' ? console.debug('[DB Connection DEBUG]', ...args) : null
};

// The issue is that the path calculation is wrong when running from the dist folder
// We need to find the actual project root, not relative to where the compiled JS is

// First check if we're running from the compiled dist directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Figure out the correct project root
let projectRoot = __dirname;

// Navigate up directories until we find the .env file or reach the filesystem root
while (!fs.existsSync(path.join(projectRoot, '.env'))) {
  const parentDir = path.dirname(projectRoot);
  // If we've reached the filesystem root, stop
  if (parentDir === projectRoot) {
    break;
  }
  projectRoot = parentDir;
}

// Show the path to the .env file for debugging
const envPath = path.join(projectRoot, '.env');
dbLogger.info(`Looking for .env file at: ${envPath}`);
dbLogger.info(`File exists: ${fs.existsSync(envPath)}`);

// In production, environment variables should be set in the environment
// In development, load from .env file
if (process.env.NODE_ENV !== 'production') {
  dbLogger.info('Loading .env file in development mode');
  dotenv.config({ path: envPath });
  dbLogger.info('After loading .env, MONGODB_URI exists:', !!process.env.MONGODB_URI);
  if (process.env.MONGODB_URI) {
    dbLogger.info('MONGODB_URI starts with:', process.env.MONGODB_URI.substring(0, 20) + '...');
  }
}

// MongoDB Connection Configuration
const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.DB_NAME || 'tip_md';

dbLogger.info(`DB_NAME from env: ${DB_NAME}`);
dbLogger.info(`MONGODB_URI available: ${!!MONGODB_URI}`);

// Connection Pool
let client: MongoClient | null = null;
let db: Db | null = null;

// Force disable mock mode - we always want to use the real MongoDB
let mockMode = false;

// Create a MongoDB client
if (!MONGODB_URI) {
  dbLogger.error('MONGODB_URI environment variable is not set. Please configure it in your .env file or environment variables.');
} else {
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

/**
 * Initialize the MongoDB connection
 * @returns {Promise<Db>} MongoDB database instance
 */
export async function connectToDatabase(): Promise<Db> {
  try {
    if (db) {
      dbLogger.info('Using existing database connection');
      return db;
    }

    if (!MONGODB_URI || !client) {
      throw new Error('MongoDB URI not provided or client not initialized');
    }

    dbLogger.info('Connecting to MongoDB...');
    
    // Connect to MongoDB
    await client.connect();
    dbLogger.info('Connected successfully to MongoDB');
    
    // Get the database
    db = client.db(DB_NAME);
    
    return db;
  } catch (error) {
    dbLogger.error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Get the database instance
 * @returns {Promise<Db>} MongoDB database instance
 */
export async function getDb(): Promise<Db> {
  if (!db) {
    return connectToDatabase();
  }
  return db;
}

/**
 * Close the MongoDB connection
 */
export async function closeConnection(): Promise<void> {
  try {
    if (client) {
      await client.close();
      db = null;
      dbLogger.info('MongoDB connection closed');
    }
  } catch (error) {
    dbLogger.error(`Error closing MongoDB connection: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Hide credentials in the MongoDB URI for logging
 * @param uri MongoDB connection URI
 * @returns URI with hidden credentials
 */
function hideCredentials(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
}

/**
 * Set the mockMode for testing
 */
export function setMockMode(mode: boolean): void {
  mockMode = mode;
}

/**
 * Check if we're in mock mode
 */
export function isMockMode(): boolean {
  return mockMode;
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
}); 