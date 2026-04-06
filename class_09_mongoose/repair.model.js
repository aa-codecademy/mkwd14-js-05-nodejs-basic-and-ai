import mongoose from 'mongoose';

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
		timestamps: true,
	},
);

const Reminder = mongoose.model('Reminder', reminderSchema);

export default Reminder;
