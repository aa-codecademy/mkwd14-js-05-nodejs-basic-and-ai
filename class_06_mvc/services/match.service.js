import { Match, MatchModel } from '../models/match.model.js';
import { Team } from '../models/team.model.js';

export class MatchService {
	async getAll() {
		const matches = await Match.getAll();
		console.log('🚀 ivo-test ~ MatchService ~ getAll ~ matches:', matches);
		return Promise.all(matches.map(match => this.#enrich(match)));
	}

	async getById(id) {
		const match = await Match.getById(id);

		if (!match) {
			const err = new Error(`Match with ID:${id} doesn't exist.`);
			err.status = 404;
			throw err;
		}

		return this.#enrich(match);
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

	async #enrich(match) {
		const [homeTeam, awayTeam] = await Promise.all([
			Team.getById(match.homeTeamId),
			Team.getById(match.awayTeamId),
		]);

		return {
			...match,
			homeTeamName: homeTeam.name,
			awayTeamName: awayTeam.name,
		};
	}
}

export const matchService = new MatchService();
