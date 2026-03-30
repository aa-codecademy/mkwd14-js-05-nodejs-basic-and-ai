import { Router } from 'express';
import { matchController } from '../controllers/match.controller.js';

// /api/matches
const matchRouter = new Router();

// /api/matches
matchRouter.get('/', matchController.getAll);
// /api/matches/:id
matchRouter.get('/:id', matchController.getById);
// /api/matches/schedule
matchRouter.post('/schedule', matchController.scheduleMatch);
// /api/matches/:id/start
matchRouter.put('/:id/start', matchController.startMatch);
// /api/matches/:id/finish
matchRouter.put('/:id/finish', matchController.finishMatch);
// /api/matches/:id/postpone
matchRouter.put('/:id/postpone', matchController.postponeMatch);

export default matchRouter;
