import mongoose from 'mongoose';

// Centralise allowed statuses in one place so the rest of the app does not
// rely on scattered string literals like "live" or "finished".
export const MATCH_STATUSES = {
	SCHEDULED: 'scheduled',
	LIVE: 'live',
	FINISHED: 'finished',
	POSTPONED: 'postponed',
};

// Each goal is stored as a subdocument inside a match so we keep both the
// running score and the timeline of who scored and when.
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

// Match documents keep references to two Team documents plus live match data
// such as score, minute, status, and goal history.
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

// Reuse the existing model if the file is reloaded during development.
export const Match =
	mongoose.models.Match || mongoose.model('Match', matchSchema);
