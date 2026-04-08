import { Router } from 'express';
import { seedController } from '../controllers/seed.controller.js';

const seedRouter = Router();

// Exposes a simple endpoint that fills MongoDB with the demo teams used in
// class examples.
seedRouter.post('', seedController.seedDatabase);

export default seedRouter;
