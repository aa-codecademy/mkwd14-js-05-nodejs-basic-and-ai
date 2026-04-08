import mongoose from 'mongoose';

function buildMongoURI() {
	const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_CLUSTER, DB_NAME } =
		process.env;

	if (!MONGO_USERNAME || !MONGO_PASSWORD || !MONGO_CLUSTER || !DB_NAME) {
		throw new Error(
			'Missing required MongoDB connection environment variables',
		);
	}

	// retryWrites=true:
	// If a write fails because of a transient issue (network blip, primary step-down),
	// the MongoDB driver retries eligible write operations automatically once.
	// This improves reliability for short-lived infrastructure hiccups.
	//
	// w=majority:
	// MongoDB acknowledges a write only after it is replicated to the majority of
	// replica set members. This is slower than w=1, but gives stronger durability
	// guarantees and reduces risk of data loss during failover.
	//
	// appName=FootballLeagueTracker:
	// Adds a friendly client name in Atlas metrics/logs/profiler entries so this
	// app's traffic is easier to identify during monitoring and debugging.
	return `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_CLUSTER}/${DB_NAME}?retryWrites=true&w=majority&appName=FootballLeagueTracker`;
}

export async function connectToDatabase() {
	const mongoURI = buildMongoURI();

	await mongoose.connect(mongoURI);
	console.log(`MongoDB connected: ${mongoose.connection.name}`);
}
