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

	scheduleMatch = async (req, res, next) => {
		try {
			const { homeTeamId, awayTeamId, scheduledAt } = req.body;

			if (!homeTeamId || !awayTeamId) {
				const err = new Error(`homeTeamId and awayTeamId are required.`);
				err.status = 400;
				return next(err);
			}

			if (homeTeamId === awayTeamId) {
				const err = new Error(`A team cannot play with itself.`);
				err.status = 400;
				return next(err);
			}

			const match = await matchService.scheduleMatch(
				homeTeamId,
				awayTeamId,
				scheduledAt,
			);

			res.json(match);
		} catch (error) {
			next(error);
		}
	};
}

export const matchController = new MatchController();
