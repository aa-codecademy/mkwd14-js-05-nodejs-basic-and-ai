import { Match } from '../models/match.model.js';
import { Team } from '../models/team.model.js';

export class MatchService {
	getAll() {
		return Match.getAll();
	}

	async scheduleMatch(homeTeamId, awayTeamId, scheduledAt) {
		const homeTeam = await Team.getById(homeTeamId);
		const awayTeam = await Team.getById(awayTeamId);

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

		const match = await Match.create(homeTeamId, awayTeamId, scheduledAt);

		return match;
	}
}

export const matchService = new MatchService();
