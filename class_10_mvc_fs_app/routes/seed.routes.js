import { Router } from 'express';
import { seedController } from '../controllers/seed.controller.js';

const seedRouter = Router();

seedRouter.post('', seedController.seedDatabase);

export default seedRouter;
