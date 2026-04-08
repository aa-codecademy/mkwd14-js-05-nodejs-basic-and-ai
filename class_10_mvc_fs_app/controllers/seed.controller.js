import { seedService } from '../services/seed.service.js';

export class SeedController {
	seedDatabase = async (req, res, next) => {
		try {
			const result = await seedService.seedDatabase();
			res.status(201).json(result);
		} catch (err) {
			next(err);
		}
	};
}

export const seedController = new SeedController();
