import { teamService } from '../services/team.service.js';

export class TeamController {
	createTeam = async (req, res) => {
		const { name, country, stadium, founded } = req.body;

		const team = teamService.createTeam({ name, country, stadium, founded });

		res.status(201).json(team);
	};
}

export const teamController = new TeamController();
