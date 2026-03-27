import { Team } from '../models/team.model.js';

export class TeamService {
	createTeam(data) {
		return Team.create(data);
	}
}

export const teamService = new TeamService();
