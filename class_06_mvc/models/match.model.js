import { DbService } from '../services/db.service.js';

export class MatchModel {
	#db = new DbService('matches.json');

	#read() {
		return this.#db.read();
	}

	#write(data) {
		return this.#db.write(data);
	}

	getAll() {
		return this.#read();
	}
}

export const matchModel = new MatchModel();
