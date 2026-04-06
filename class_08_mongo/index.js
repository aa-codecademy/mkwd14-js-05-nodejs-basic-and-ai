import express from "express";
import { ObjectId } from "mongodb";
import { connectToDb, getDb } from "./db.js";
import {
  createReminderSchema,
  updateReminderSchema,
} from "./schemas/reminder.schema.js";
import { validateRequest } from "./validate-request.js";

/**
 * class_08_mongo/index.js
 * This example uses the official MongoDB Node driver directly (without Mongoose).
 * Students can see exactly what MongoDB commands are executed for each endpoint.
 */

const PORT = 3000;
const HOSTNAME = "localhost";

const app = express();

// Global middleware that parses JSON body into req.body.
app.use(express.json());

app.get("/api/reminders", async (req, res) => {
  // Read all documents from the reminders collection.
  // find() returns a cursor, and toArray() materializes the results into JSON.
  const reminders = await getDb().collection("reminders").find().toArray();

  res.status(200).json(reminders);
});

app.get("/api/reminders/:id", async (req, res) => {
  const { id } = req.params;

  // MongoDB document IDs are ObjectId values, so we convert the URL string first.
  const reminder = await getDb()
    .collection("reminders")
    .findOne({ _id: new ObjectId(id) });

  res.json(reminder);
});

app.post(
  "/api/reminders",
  validateRequest(createReminderSchema),
  async (req, res) => {
    const body = req.body;

    // insertOne returns metadata (insertedId, acknowledged), not only the document.
    const result = await getDb().collection("reminders").insertOne(body);

    res.status(201).json(result);
  },
);

app.put(
  "/api/reminders/:id",
  validateRequest(updateReminderSchema),
  async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    // $set updates only provided fields and keeps the rest of the document unchanged.
    const result = await getDb()
      .collection("reminders")
      .updateOne({ _id: new ObjectId(id) }, { $set: body });

    res.json(result);
  },
);

app.delete("/api/reminders/:id", async (req, res) => {
  const { id } = req.params;

  // deleteOne removes a single matching document.
  const result = await getDb()
    .collection("reminders")
    .deleteOne({ _id: new ObjectId(id) });

  res.json(result);
});

app.listen(PORT, HOSTNAME, async () => {
  // Connect before serving requests so routes can safely use getDb().
  await connectToDb();
  console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
});
