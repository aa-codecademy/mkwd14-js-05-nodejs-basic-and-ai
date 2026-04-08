import teams from '../data/teams.js';
import { Team } from '../models/team.model.js';

export class SeedService {
	async seedDatabase() {
		if (!teams?.length) {
			throw new Error('No teams to seed. Please check the data/teams.js file.');
		}

		// Start from a clean collection so repeated seeding produces the same
		// result and students can reset the database during demos.
		await Team.deleteMany({});

		// insertMany() creates all documents in one database call.
		await Team.insertMany(teams);

		return {
			message: 'Database seeded successfully.',
			insertedCount: teams.length,
		};
	}
}

export const seedService = new SeedService();
