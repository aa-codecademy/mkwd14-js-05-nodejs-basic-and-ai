import { randomUUID } from 'crypto';
import { DbService } from '../services/db.service.js';

export class TeamModel {
	#db = new DbService('teams.json');

	#read() {
		return this.#db.read();
	}

	#write(teams) {
		return this.#db.write(teams);
	}

	getAll() {
		return this.#read();
	}

	async create({ name, country, stadium, founded }) {
		const teams = await this.#read();

		const isExists = teams.some(
			team => team.name.toLowerCase() === name.toLowerCase(),
		);

		if (isExists) {
			throw new Error(`Team with name: ${name} already exists.`);
		}

		const team = {
			id: randomUUID(),
			name,
			country,
			stadium: stadium || 'Unknown Stadium',
			founded: founded || null,
			wins: 0,
			draws: 0,
			losses: 0,
			goalsFor: 0,
			goalsAgainst: 0,
		};

		teams.push(team);
		this.#write(teams);

		return team;
	}
}

export const Team = new TeamModel();
