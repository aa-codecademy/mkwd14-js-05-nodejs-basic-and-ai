import { randomUUID } from 'crypto';

export class TeamModel {
	create({ name, country, stadium, founded }) {
		const team = {
			id: randomUUID(),
			name,
			country,
			stadium: stadium || 'Unknown Stadium',
			founded: founded || null,
			wins: 0,
			draws: 0,
			losses: 0,
			goalsFor: 0,
			goalsAgainst: 0,
		};

		return team;
	}
}

export const Team = new TeamModel();
