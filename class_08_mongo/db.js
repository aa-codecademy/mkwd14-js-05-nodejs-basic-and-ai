import { MongoClient } from 'mongodb';

const MONGO_USERNAME = 'sedc_test';
const MONGO_PASSWORD = 'ppufWK0cbKDk6f2j';
const MONGO_CLUSTER = 'cluster0';
const DB_NAME = 'g2_test';

const client = new MongoClient(
	`mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_CLUSTER}.3y9yiup.mongodb.net/${DB_NAME}?appName=Cluster0`,
);

let db = null;

export async function connectToDb() {
	try {
		const connection = await client.connect();
		db = connection.db();
		console.log('Connected to MongoDB');
	} catch (error) {
		console.error('Error connecting to MongoDB:', error);
		process.exit(1);
	}
}

export function getDb() {
	if (!db) {
		console.log('Database is not initialized. Initializing now...');
	}
	return db;
}
