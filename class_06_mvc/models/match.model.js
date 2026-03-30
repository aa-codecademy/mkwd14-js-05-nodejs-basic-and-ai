import { DbService } from '../services/db.service.js';
import { randomUUID } from 'crypto';

export class MatchModel {
	#db = new DbService('matches.json');

	static STATUS = {
		SCHEDULED: 'scheduled',
		LIVE: 'live',
		FINISHED: 'finished',
		POSTPONED: 'postponed',
	};

	#read() {
		return this.#db.read();
	}

	#write(data) {
		return this.#db.write(data);
	}

	getAll() {
		return this.#read();
	}

	async create(homeTeamId, awayTeamId, scheduledAt) {
		const matches = await this.#read();

		const match = {
			id: randomUUID(),
			homeTeamId,
			awayTeamId,
			scheduledAt: scheduledAt || new Date().toISOString(),
			homeScore: 0,
			awayScore: 0,
			goals: [],
			minute: 0,
			startedAt: null,
			finishedAt: null,
			postponedTo: null,
			status: MatchModel.STATUS.SCHEDULED,
		};

		matches.push(match);
		await this.#write(matches);
		return match;
	}
}

export const Match = new MatchModel();
