import express from 'express';
import { connectToDb, getDb } from './db.js';

const PORT = 3000;
const HOSTNAME = 'localhost';

const app = express();

app.use(express.json());

app.get('/', async (req, res) => {
	const reminders = await getDb().collection('reminders').find().toArray();

	res.status(200).json(reminders);
});

app.listen(PORT, HOSTNAME, async () => {
	await connectToDb();
	console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
});
