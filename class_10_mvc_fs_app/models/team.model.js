import mongoose from 'mongoose';

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

teamSchema.virtual('points').get(function () {
	return this.wins * 3 + this.draws;
});

teamSchema.virtual('goalDifference').get(function () {
	return this.goalsFor - this.goalsAgainst;
});

export const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);
