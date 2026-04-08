import { Match, MATCH_STATUSES } from '../models/match.model.js';
import { Team } from '../models/team.model.js';

export class MatchService {
	async getAll() {
		const matches = await Match.find().populate('homeTeamId awayTeamId').lean();
		return matches.map(match => this.#serializeMatch(match));
	}

	async getById(id) {
		const match = await Match.findById(id);

		if (!match) {
			const err = new Error(`Match with ID:${id} doesn't exist.`);
			err.status = 404;
			throw err;
		}

		return match.toJSON();
	}

	async scheduleMatch(homeTeamId, awayTeamId, scheduledAt) {
		const homeTeam = await Team.findById(homeTeamId);
		const awayTeam = await Team.findById(awayTeamId);

		if (!homeTeam) {
			const err = new Error(`Home team doesn't exist.`);
			err.status = 404;
			throw err;
		}
		if (!awayTeam) {
			const err = new Error(`Away team doesn't exist.`);
			err.status = 404;
			throw err;
		}

		const match = await Match.create({ homeTeamId, awayTeamId, scheduledAt });

		return match.toJSON();
	}

	async startMatch(id) {
		const match = await this.getById(id);

		if (match.status !== MatchModel.STATUS.SCHEDULED) {
			const err = new Error(
				`Match with ID:${id} cannot be started because is currently: ${match.status}`,
			);
			err.status = 400;
			throw err;
		}

		const updatedMatch = await Match.update(id, {
			status: MatchModel.STATUS.LIVE,
			startedAt: new Date().toISOString(),
		});

		return updatedMatch;
	}

	async finishMatch(id) {
		const match = await this.getById(id);

		if (match.status !== MatchModel.STATUS.LIVE) {
			const err = new Error(
				`Match with ID:${id} cannot be finished because is currently: ${match.status}`,
			);
			err.status = 400;
			throw err;
		}

		const updatedMatch = await Match.update(id, {
			status: MatchModel.STATUS.FINISHED,
			finishedAt: new Date().toISOString(),
		});

		return updatedMatch;
	}

	async postponeMatch(id) {
		const match = await this.getById(id);

		if (match.status !== MatchModel.STATUS.SCHEDULED) {
			const err = new Error(
				`Match with ID:${id} cannot be postponed because is currently: ${match.status}`,
			);
			err.status = 400;
			throw err;
		}

		const updatedMatch = await Match.update(id, {
			status: MatchModel.STATUS.POSTPONED,
			postponedTo: new Date('2027-01-01').toISOString(),
		});

		return updatedMatch;
	}

	async addGoal(matchId, { teamId, scorer, minute }) {
		// Reuse getById() so we get a 404 automatically if match does not exist.
		const match = await this.getById(matchId);

		// Goals are allowed only while the match is live.
		if (match.status !== MatchModel.STATUS.LIVE) {
			const err = new Error('Match is not live.');
			err.status = 400;
			throw err;
		}

		// Safety check: goal can only be assigned to one of the two teams in this match.
		if (teamId && teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
			const err = new Error('Team not involved in this match.');
			err.status = 400;
			throw err;
		}

		// Append a new goal event. This keeps a full event log, not only total score.
		match.goals.push({ id: randomUUID(), teamId, scorer, minute });

		// Update aggregate score based on which side scored.
		if (teamId === match.homeTeamId) {
			match.homeScore += 1;
		} else if (teamId === match.awayTeamId) {
			match.awayScore += 1;
		}

		// Persist only changed fields; Match.update handles merge with old record.
		const updatedMatch = await Match.update(matchId, {
			goals: match.goals,
			homeScore: match.homeScore,
			awayScore: match.awayScore,
		});

		return updatedMatch;
	}

	#serializeMatch(match) {
		return {
			...match,
			homeTeamName: match.homeTeamId.name,
			awayTeamName: match.awayTeamId.name,
		};
	}
}

// Singleton instance — same pattern as TeamService.
export const matchService = new MatchService();
