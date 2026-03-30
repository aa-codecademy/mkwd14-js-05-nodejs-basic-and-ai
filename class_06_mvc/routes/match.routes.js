import { Router } from 'express';
import { matchController } from '../controllers/match.controller.js';

// /api/matches
const matchRouter = new Router();

// /api/matches
matchRouter.get('/', matchController.getAll);

export default matchRouter;
