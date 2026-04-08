import { seedService } from '../services/seed.service.js';

export class SeedController {
	seedDatabase = async (req, res, next) => {
		try {
			// The controller stays thin: delegate the actual seeding work to the
			// service and only translate the result into an HTTP response.
			const result = await seedService.seedDatabase();
			res.status(201).json(result);
		} catch (err) {
			next(err);
		}
	};
}

export const seedController = new SeedController();
