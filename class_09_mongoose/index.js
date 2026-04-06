import express from 'express';
import { ObjectId } from 'mongodb';
import {
	createReminderSchema,
	updateReminderSchema,
} from './schemas/reminder.schema.js';
import { validateRequest } from './validate-request.js';
import Reminder from './repair.model.js';
import mongoose from 'mongoose';

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

const MONGO_USERNAME = 'sedc_test';
const MONGO_PASSWORD = 'ppufWK0cbKDk6f2j';
const MONGO_CLUSTER = 'cluster0';
const DB_NAME = 'g2_test';

const PORT = 3000;
const HOSTNAME = 'localhost';

const app = express();

// Global middleware that parses JSON body into req.body.
app.use(express.json());

app.get('/api/reminders', async (req, res) => {
	// getDb() comes from db.js (shared DB connection module).
	// Then we access the "reminders" collection and return all documents.
	const reminders = await Reminder.find();

	res.status(200).json(reminders);
});

app.get('/api/reminders/:id', async (req, res) => {
	const { id } = req.params;

	// const reminder = await Reminder.find({
	// 	_id: new ObjectId(id),
	// });
	// const reminder = await Reminder.findOne({ _id: new ObjectId(id) });
	const reminder = await Reminder.findById(id);

	res.json(reminder);
});

app.post(
	'/api/reminders',
	validateRequest(createReminderSchema),
	async (req, res) => {
		const body = req.body;

		const reminder = new Reminder(body);

		const result = await reminder.save();

		res.status(201).json(result);
	},
);

app.put(
	'/api/reminders/:id',
	validateRequest(updateReminderSchema),
	async (req, res) => {
		try {
			const id = req.params;
			const body = req.body;

			// For testing validation — try to update a reminder with invalid fields (e.g. isCompleted: 'nevalidno').
			// body.email = 'testing wrong db update';
			// body.isCompleted = 'nevalidno';

			const result = await Reminder.findByIdAndUpdate(new ObjectId(id), body, {
				new: true, // Return the updated document instead of the original.
			});
			// const result = await Reminder.findOneAndUpdate(
			// 	{ _id: new ObjectId(id) },
			// 	body,
			// 	{
			// 		new: true, // Return the updated document instead of the original.
			// 	},
			// );
			// const result = await Reminder.updateOne(
			// 	{ _id: new ObjectId(id) },
			// 	body,
			// 	{
			// 		new: true, // Return the updated document instead of the original.
			// 	},
			// );

			res.json(result);
		} catch (error) {
			console.error('Error updating reminder:', error);
			res
				.status(500)
				.json({ error: 'An error occurred while updating the reminder.' });
		}
	},
);

app.delete('/api/reminders/:id', async (req, res) => {
	const { id } = req.params;

	const result = await Reminder.findByIdAndDelete(new ObjectId(id));
	// const result = await Reminder.findOneAndDelete({ _id: new ObjectId(id) });
	// const result = await Reminder.deleteOne({ _id: new ObjectId(id) });

	res.json(result);
});

app.listen(PORT, HOSTNAME, async () => {
	// Connect before serving requests so routes can safely use getDb().
	try {
		await mongoose.connect(
			`mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_CLUSTER}.3y9yiup.mongodb.net/${DB_NAME}?appName=Cluster0`,
		);
		console.log('Successfully connected to the database.');
		console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
	} catch (error) {
		console.error('Error while connecting to the database!');
	}
});
