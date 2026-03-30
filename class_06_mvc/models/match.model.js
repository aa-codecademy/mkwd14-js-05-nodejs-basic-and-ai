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

	async getById(id) {
		const matches = await this.#read();

		return matches.find(match => match.id === id) ?? null;
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

	async update(id, { status, startedAt, finishedAt, postponedTo }) {
		const matches = await this.#read();

		const index = matches.findIndex(match => match.id === id);

		if (index === -1) {
			const err = new Error(`Match with ID: ${id} doesn't exist.`);
			err.status = 404;
			throw err;
		}

		matches[index] = {
			...matches[index],
			status,
			startedAt: startedAt ? startedAt : matches[index].startedAt,
			finishedAt: finishedAt ? finishedAt : matches[index].finishedAt,
			postponedTo: postponedTo ? postponedTo : matches[index].postponedTo,
		};

		this.#write(matches);

		return matches[index];
	}
}

export const Match = new MatchModel();
