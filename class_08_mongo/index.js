import express from 'express';
import { connectToDb, getDb } from './db.js';
import { ObjectId } from 'mongodb';

/**
 * class_08_mongo/index.js
 * -----------------------
 * App entry point for this MongoDB classroom example.
 *
 * FLOW OVERVIEW:
 * 1) The server starts and calls connectToDb() from db.js.
 * 2) db.js opens one Mongo connection and stores the database reference.
 * 3) Route handlers call getDb() to access collections.
 * 4) This route reads "reminders" collection and returns JSON.
 */

const PORT = 3000;
const HOSTNAME = 'localhost';

const app = express();

// Global middleware that parses JSON body into req.body.
app.use(express.json());

app.get('/api/reminders', async (req, res) => {
	// getDb() comes from db.js (shared DB connection module).
	// Then we access the "reminders" collection and return all documents.
	const reminders = await getDb().collection('reminders').find().toArray();

	res.status(200).json(reminders);
});

app.get('/api/reminders/:id', async (req, res) => {
	const { id } = req.params;

	console.log('params id', id);

	const reminder = await getDb()
		.collection('reminders')
		.findOne({ _id: new ObjectId(id) });

	res.json(reminder);
});

app.post('/api/reminders', async (req, res) => {
	const body = req.body;

	const result = await getDb().collection('reminders').insertOne(body);

	res.status(201).json(result);
});

app.put('/api/reminders/:id', async (req, res) => {
	const id = req.params;
	const body = req.body;

	const result = await getDb()
		.collection('reminders')
		.updateOne({ _id: new ObjectId(id) }, { $set: body });

	res.json(result);
});

app.delete('/api/reminders/:id', async (req, res) => {
	const { id } = req.params;

	const result = await getDb()
		.collection('reminders')
		.deleteOne({ _id: new ObjectId(id) });

	res.json(result);
});

app.listen(PORT, HOSTNAME, async () => {
	// Connect before serving requests so routes can safely use getDb().
	await connectToDb();
	console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
});
