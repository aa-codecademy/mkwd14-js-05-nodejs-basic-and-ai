import express from "express";
import mongoose from "mongoose";
import Reminder from "./repair.model.js";
import {
  createReminderSchema,
  updateReminderSchema,
} from "./schemas/reminder.schema.js";
import { validateRequest } from "./validate-request.js";

/**
 * class_09_mongoose/index.js
 * This example uses Mongoose (ODM) on top of MongoDB.
 *
 * IMPORTANT FOR STUDENTS:
 * - We intentionally do not use full MVC folders to keep this lesson simple.
 * - Route, controller-like, and service-like logic are colocated.
 * - Inline comments show what would move to router/controller/service/model
 *   in a production MVC codebase.
 */

const MONGO_USERNAME = "sedc_test";
const MONGO_PASSWORD = "ppufWK0cbKDk6f2j";
const MONGO_CLUSTER = "cluster0";
const DB_NAME = "g2_test";

const PORT = 3000;
const HOSTNAME = "localhost";

const app = express();

app.use(express.json());

app.get("/api/reminders", async (req, res) => {
  // Router: defines GET /api/reminders.
  // Controller: handles request and returns HTTP response.
  // Service: decides to fetch all reminders.
  // Model: Reminder.find() executes the Mongo query via Mongoose.
  const reminders = await Reminder.find();
  res.status(200).json(reminders);
});

app.get("/api/reminders/:id", async (req, res) => {
  // Router: defines path param :id.
  // Controller: reads id from req.params.
  const { id } = req.params;

  // Service: "get reminder by id" use-case.
  // Model: findById is a model-level data access method.
  const reminder = await Reminder.findById(id);
  res.json(reminder);
});

app.post(
  "/api/reminders",
  validateRequest(createReminderSchema),
  async (req, res) => {
    // Controller: receives already validated input.
    const body = req.body;

    // Service: create reminder use-case.
    // Model: `new Reminder(...)` creates a document instance.
    const reminder = new Reminder(body);
    // Model: save() persists the document to MongoDB.
    const result = await reminder.save();

    res.status(201).json(result);
  },
);

app.put(
  "/api/reminders/:id",
  validateRequest(updateReminderSchema),
  async (req, res) => {
    try {
      // Controller: read inputs from request.
      const { id } = req.params;
      const body = req.body;

      // Service: update reminder use-case.
      // Model: findByIdAndUpdate updates by _id and returns updated doc with new:true.
      const result = await Reminder.findByIdAndUpdate(id, body, {
        new: true,
      });

      res.json(result);
    } catch (error) {
      console.error("Error updating reminder:", error);
      res
        .status(500)
        .json({ error: "An error occurred while updating the reminder." });
    }
  },
);

app.delete("/api/reminders/:id", async (req, res) => {
  // Controller: read id from route.
  const { id } = req.params;

  // Service: delete reminder use-case.
  // Model: findByIdAndDelete removes the matching document.
  const result = await Reminder.findByIdAndDelete(id);
  res.json(result);
});

app.listen(PORT, HOSTNAME, async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_CLUSTER}.3y9yiup.mongodb.net/${DB_NAME}?appName=Cluster0`,
    );
    console.log("Successfully connected to the database.");
    console.log(`Server is running on http://${HOSTNAME}:${PORT}`);
  } catch (error) {
    console.error("Error while connecting to the database!");
  }
});
