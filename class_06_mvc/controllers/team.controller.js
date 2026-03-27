import { teamService } from '../services/team.service.js';

export class TeamController {
	getTeams = async (req, res) => {
		const teams = await teamService.getTeams();

		res.json(teams);
	};

	createTeam = async (req, res, next) => {
		try {
			const { name, country, stadium, founded } = req.body;

			if (!name || !country) {
				const error = new Error('Name and country are required fields.');
				error.status = 400;

				return next(error);
			}

			const team = await teamService.createTeam({
				name,
				country,
				stadium,
				founded,
			});

			res.status(201).json(team);
		} catch (error) {
			if (error.message.includes('already exists')) {
				error.status = 409;
			}
			next(error);
		}
	};
}

export const teamController = new TeamController();
