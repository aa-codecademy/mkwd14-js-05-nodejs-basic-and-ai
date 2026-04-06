import { MongoClient } from "mongodb";

/**
 * class_08_mongo/db.js
 * --------------------
 * This module is responsible only for MongoDB connection management.
 *
 * WHY A SEPARATE FILE?
 * - index.js keeps HTTP logic (routes/server).
 * - db.js keeps DB connection logic.
 * This separation makes the flow easier to teach and maintain.
 */

const MONGO_USERNAME = "sedc_test";
const MONGO_PASSWORD = "ppufWK0cbKDk6f2j";
const MONGO_CLUSTER = "cluster0";
const DB_NAME = "g2_test";

// Mongo connection string for Atlas.
// In real projects, credentials should be loaded from environment variables.
const client = new MongoClient(
  `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_CLUSTER}.3y9yiup.mongodb.net/${DB_NAME}?appName=Cluster0`,
);

let db = null;

export async function connectToDb() {
  try {
    // Connect once when server starts so every route reuses the same client.
    const connection = await client.connect();
    // connection.db() returns the DB selected in the connection string.
    db = connection.db();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

export function getDb() {
  // Route handlers call this helper to access collections.
  if (!db) {
    console.log("Database is not initialized. Did you call connectToDb()?");
  }
  return db;
}
