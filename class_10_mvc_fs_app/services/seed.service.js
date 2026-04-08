import teams from '../data/teams.js';
import { Team } from '../models/team.model.js';

export class SeedService {
	async seedDatabase() {
		if (!teams?.length) {
			throw new Error('No teams to seed. Please check the data/teams.js file.');
		}

		await Team.deleteMany({});

		await Team.insertMany(teams);
	}
}

export const seedService = new SeedService();
