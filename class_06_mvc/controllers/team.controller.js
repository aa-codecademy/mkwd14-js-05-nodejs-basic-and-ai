import { teamService } from '../services/team.service.js';

export class TeamController {
	getTeams = async (req, res, next) => {
		try {
			const teams = await teamService.getTeams();

			res.json(teams);
		} catch (error) {
			next(error);
		}
	};

	getLeagueTableStandings = async (req, res, next) => {
		try {
			const teams = await teamService.getLeagueTableStandings();

			res.json(teams);
		} catch (error) {
			next(error);
		}
	};

	getTeamById = async (req, res, next) => {
		try {
			const id = req.params.id;
			const team = await teamService.getTeamById(id);

			res.json(team);
		} catch (error) {
			next(error);
		}
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
