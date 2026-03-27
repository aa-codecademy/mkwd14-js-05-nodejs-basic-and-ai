import { Router } from 'express';
import { teamController } from '../controllers/team.controller.js';

const teamRouter = Router();

teamRouter.get('/', teamController.getTeams);
teamRouter.post('/', teamController.createTeam);

export default teamRouter;
