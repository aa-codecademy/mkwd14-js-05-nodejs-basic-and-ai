import { Team } from '../models/team.model.js';

export class TeamService {

	getTeams() {
		return Team.getAll()
	}

	createTeam(data) {
		return Team.create(data);
	}
}

export const teamService = new TeamService();
