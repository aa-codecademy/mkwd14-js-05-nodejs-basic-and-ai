import { matchModel } from '../models/match.model.js';

export class MatchService {
	getAll() {
		return matchModel.getAll();
	}
}

export const matchService = new MatchService();
