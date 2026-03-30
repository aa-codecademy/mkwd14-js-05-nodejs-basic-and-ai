import { Router } from 'express';
import { matchController } from '../controllers/match.controller.js';

// /api/matches
const matchRouter = new Router();

// /api/matches
matchRouter.get('/', matchController.getAll);
// /api/matches/schedule
matchRouter.post('/schedule', matchController.scheduleMatch);

export default matchRouter;
