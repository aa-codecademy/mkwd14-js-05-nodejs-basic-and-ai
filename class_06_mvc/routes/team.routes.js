import { Router } from 'express';
import { teamController } from '../controllers/team.controller.js';

// localhost:3000/api/teams
const teamRouter = Router();

teamRouter.get('/standings', teamController.getLeagueTableStandings);
teamRouter.get('/', teamController.getTeams);
// localhost:3000/api/teams/:id
teamRouter.get('/:id', teamController.getTeamById);
teamRouter.post('/', teamController.createTeam);

export default teamRouter;
