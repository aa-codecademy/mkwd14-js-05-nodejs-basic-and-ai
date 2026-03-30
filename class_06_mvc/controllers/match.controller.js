import { matchService } from '../services/match.service.js';

export class MatchController {
	getAll = async (req, res, next) => {
		try {
			const matches = await matchService.getAll();

			res.json(matches);
		} catch (error) {
			next(error);
		}
	};
}

export const matchController = new MatchController();
