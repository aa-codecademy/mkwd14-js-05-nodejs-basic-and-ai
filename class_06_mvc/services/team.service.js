import { Team } from '../models/team.model.js';

export class TeamService {
	getTeams() {
		return Team.getAll();
	}

	async getLeagueTableStandings() {
		const teams = await Team.getAll();

		return teams
			.map(team => this.#enrich(team))
			.sort(
				(a, b) => b.points - a.point || b.goalDifference - a.goalDifference,
			);
	}

	async getTeamById(id) {
		const team = await Team.getById(id);

		if (!team) {
			throw new Error(`Team with id: ${id} not found.`);
		}

		return team;
	}

	createTeam(data) {
		return Team.create(data);
	}

	#enrich(team) {
		return {
			...team,
			points: team.wins * 3 + team.draws,
			goalDifference: team.goalsFor - team.goalsAgainst,
		};
	}
}

export const teamService = new TeamService();
