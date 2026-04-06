import mongoose from "mongoose";

// Schema describes the shape of Reminder documents in MongoDB.
// Mongoose uses this schema for validation and document behavior.
const reminderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    isCompleted: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    // Adds createdAt and updatedAt automatically.
    timestamps: true,
  },
);

// Model is the main API used in the app (find, findById, save, update, delete).
const Reminder = mongoose.model("Reminder", reminderSchema);

export default Reminder;
