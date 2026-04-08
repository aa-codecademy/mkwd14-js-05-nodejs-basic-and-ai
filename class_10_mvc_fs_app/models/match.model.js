import mongoose from 'mongoose';

export const MATCH_STATUSES = {
	SCHEDULED: 'scheduled',
	LIVE: 'live',
	FINISHED: 'finished',
	POSTPONED: 'postponed',
};

const goalSchema = mongoose.Schema(
	{
		teamId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Team',
		},
		scorer: { type: String, default: 'Unknown', trim: true },
		minute: { type: Number, required: true, min: 0 },
	},
	{ id: false, versionKey: false },
);

const matchSchema = mongoose.Schema(
	{
		homeTeamId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Team',
		},
		awayTeamId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: 'Team',
		},
		homeScore: { type: Number, default: 0, min: 0 },
		awayScore: { type: Number, default: 0, min: 0 },
		status: {
			type: String,
			enum: Object.values(MATCH_STATUSES),
			default: MATCH_STATUSES.SCHEDULED,
		},
		goals: { type: [goalSchema], default: [] },
		scheduledAt: { type: Date, default: Date.now },
		startedAt: { type: Date, default: null },
		finishedAt: { type: Date, default: null },
		postponedTo: { type: Date, default: null },
		minute: { type: Number, default: 0, min: 0, max: 130 },
	},
	{
		id: false,
		versionKey: false,
	},
);

export const Match =
	mongoose.models.Match || mongoose.model('Match', matchSchema);
