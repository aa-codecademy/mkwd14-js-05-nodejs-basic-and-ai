import mongoose from 'mongoose';

// The schema describes both the shape of a team document and the validation
// rules MongoDB documents must satisfy before they are saved.
const teamSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
		},
		country: {
			type: String,
			required: true,
			trim: true,
		},
		stadium: {
			type: String,
			trim: true,
			default: 'Unknown Stadium',
		},
		founded: {
			type: Number,
			default: null,
		},
		wins: {
			type: Number,
			default: 0,
			min: 0,
		},
		draws: { type: Number, default: 0, min: 0 },
		losses: { type: Number, default: 0, min: 0 },
		goalsFor: { type: Number, default: 0, min: 0 },
		goalsAgainst: { type: Number, default: 0, min: 0 },
	},
	{
		id: false,
		timestamps: true,
		versionKey: false,
		toJSON: {
			virtuals: true,
		},
	},
);

// Virtuals are computed fields. They are derived on read, so we do not store
// duplicate data such as points and goal difference in the database.
teamSchema.virtual('points').get(function () {
	return this.wins * 3 + this.draws;
});

teamSchema.virtual('goalDifference').get(function () {
	return this.goalsFor - this.goalsAgainst;
});

// Reuse the existing model if it was already compiled during hot reload.
export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
